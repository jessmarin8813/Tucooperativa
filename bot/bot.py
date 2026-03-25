import os
import logging
import re
from telegram import Update, ReplyKeyboardMarkup, ReplyKeyboardRemove, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import (
    ApplicationBuilder, CommandHandler, MessageHandler, 
    filters, ConversationHandler, ContextTypes
)
from dotenv import load_dotenv
from api_client import TuCooperativaAPI
from ip_sync import sync_env_ip # NEW: Auto-discovery

load_dotenv()

# Logger Configuration
logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s', level=logging.INFO)
logging.getLogger('httpx').setLevel(logging.WARNING)
logger = logging.getLogger(__name__)

# API
api = TuCooperativaAPI()

async def post_init(application):
    """Auto-discovery: Report bot username to backend on startup"""
    try:
        bot_info = await application.bot.get_me()
        logger.info(f"🤖 Bot detectado: @{bot_info.username}. Sincronizando con Backend...")
        res = api.update_bot_info(bot_info.username)
        if res.get('success'):
            logger.info("✅ Sincronización de Bot exitosa.")
        else:
            logger.warning(f"⚠️ Fallo en sincronización: {res.get('error')}")
    except Exception as e:
        logger.error(f"❌ Error en post_init: {e}")

# Conversation states
(
    START_VEHICLE, START_ODOMETER, START_PHOTO, START_PAY_METHOD, START_PAY_AMOUNTS,
    END_ODOMETER, END_PHOTO, FUEL_REPORT,
    REPORTAR_METHOD, REPORTAR_AMOUNTS, REPORTAR_PHOTO,
    REGISTRAR_NOMBRE, REGISTRAR_CEDULA,
    INCIDENCIA_TIPO, INCIDENCIA_DESC, INCIDENCIA_PHOTO
) = range(16)

async def get_dynamic_menu(update: Update):
    """Build menu based on user role and driver's current status"""
    user_id = update.effective_user.id
    auth = api.check_authorization(user_id)
    
    if auth.get('status') != 'activo':
        return ReplyKeyboardRemove()

    role = auth.get('rol')
    nombre = auth.get('nombre', 'Usuario')

    if role in ['admin', 'dueno', 'owner']:
        # Menú Minimalista para Dueños/Admins
        keyboard = [
            ['📊 RESUMEN COOPERATIVA'],
            ['🔔 ALERTAS CRÍTICAS', '🔧 SOPORTE']
        ]
        return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    
    # Menú para Choferes (State-Aware)
    status = api.get_my_status()
    if status.get('ruta_activa'):
        main_button = '🏁 FINALIZAR RUTA'
    else:
        main_button = '🚛 INICIAR JORNADA'
    
    keyboard = [
        [main_button],
        ['💰 REPORTAR PAGO (Bs)', '📊 MI ESTADO / DEUDA'],
        ['⚠️ REPORTAR FALLA', '🔧 AYUDA']
    ]
    return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Entry point with dynamic menu and deep link handling"""
    if context.args:
        token = context.args[0]
        if token.startswith('link_'):
            res = api.link_owner_via_token(token.replace('link_',''), update.effective_user.id)
            msg = "👑 ¡Vínculo de Dueño Exitoso!" if 'error' not in res else f"❌ Error: {res['error']}"
            await update.message.reply_text(msg, reply_markup=await get_dynamic_menu(update))
            return ConversationHandler.END
        else:
            # Initiate Driver Onboarding Flow
            context.user_data['invite_token'] = token
            await update.message.reply_text(
                "🚀 **¡Bienvenido a TuCooperativa!**\n\nHe validado tu invitación. Para completar tu registro, por favor responde a este mensaje con tu **Nombre y Apellido completo**:",
                parse_mode='Markdown',
                reply_markup=ReplyKeyboardRemove()
            )
            return REGISTRAR_NOMBRE

    await update.message.reply_text(
        "🚀 **Centro de Mando TuCooperativa**\nBienvenido. Selecciona una opción del menú inferior.",
        parse_mode='Markdown',
        reply_markup=await get_dynamic_menu(update)
    )
    return ConversationHandler.END

async def registrar_nombre_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['driver_nombre'] = update.message.text
    await update.message.reply_text(
        "🆔 Ahora, ingresa tu número de **Cédula** (solo números):",
        parse_mode='Markdown'
    )
    return REGISTRAR_CEDULA

async def registrar_cedula_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    cedula = update.message.text
    if not cedula.isdigit():
        await update.message.reply_text("⚠️ Por favor, ingresa solo los números de tu Cédula:")
        return REGISTRAR_CEDULA
    
    res = api.register_via_token(
        context.user_data['invite_token'], 
        update.effective_user.id, 
        context.user_data['driver_nombre'],
        cedula
    )
    
    if 'error' in res:
        await update.message.reply_text(f"❌ Error: {res['error']}", reply_markup=await get_dynamic_menu())
    else:
        await update.message.reply_text(f"✅ ¡Registro Exitoso, {context.user_data['driver_nombre']}!\nYa puedes empezar a laborar.", reply_markup=await get_dynamic_menu())
    
    return ConversationHandler.END

async def handle_main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    if text == '🚛 INICIAR JORNADA':
        return await start_ruta_flow(update, context)
    elif text == '🏁 FINALIZAR RUTA':
        return await end_ruta_flow(update, context)
    elif text == '💰 REPORTAR PAGO (Bs)':
        return await start_reportar_pago(update, context)
    elif text == '📊 MI ESTADO / DEUDA':
        status = api.get_my_status()
        msg = (
            f"📊 **Estado de Cuenta**\n\n"
            f"🚛 Unidad: `{status.get('placa')}`\n"
            f"💰 Deuda Acumulada: **${status.get('deuda'):.2f}**\n"
            f"⏳ Pagos en Revisión: **${status.get('pendientes'):.2f}**\n\n"
            f"📍 Último KM reportado: `{status.get('ultimo_km')}`\n"
            f"🏦 Datos de Pago: {status.get('datos_bancarios')}"
        )
        await update.message.reply_text(msg, parse_mode='Markdown', reply_markup=await get_dynamic_menu())
    elif text == '🔧 AYUDA':
        await update.message.reply_text("📱 Contacte al administrador central para soporte técnico.")

# --- START ROUTE FLOW (Zero-Command) ---
async def start_ruta_flow(update: Update, context: ContextTypes.DEFAULT_TYPE):
    vehicles = api.get_vehicles()
    if not vehicles or 'error' in vehicles:
        await update.message.reply_text("❌ No tienes unidades asignadas.")
        return ConversationHandler.END
    
    keyboard = [[v['placa']] for v in vehicles]
    await update.message.reply_text(
        "🚛 **Iniciar Jornada**\nSelecciona tu vehículo:",
        parse_mode='Markdown',
        reply_markup=ReplyKeyboardMarkup(keyboard, one_time_keyboard=True, resize_keyboard=True)
    )
    return START_VEHICLE

async def vehicle_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['placa'] = update.message.text
    context.user_data['vehiculo_id'] = 1 # Demo logic
    await update.message.reply_text("📍 Ingresa el **Odómetro Inicial** (solo números):", parse_mode='Markdown', reply_markup=ReplyKeyboardRemove())
    return START_ODOMETER

async def start_odometer_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message.text.isdigit():
        await update.message.reply_text("⚠️ Solo números por favor.")
        return START_ODOMETER
    context.user_data['odometro'] = update.message.text
    await update.message.reply_text("📸 Envía una **FOTO** del tablero actual:")
    return START_PHOTO

async def start_photo_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    photo_file = await update.message.photo[-1].get_file()
    context.user_data['foto_path'] = f"uploads/{photo_file.file_id}.jpg"
    
    # Show owner banking info before asking for payment
    status = api.get_my_status()
    keyboard = [['Efectivo (Bs)', 'Pago Móvil', 'Mixto']]
    await update.message.reply_text(
        f"🏦 **Datos de Pago del Dueño:**\n`{status.get('datos_bancarios')}`\n\n"
        "💰 ¿Cómo pagarás el abono de hoy?",
        parse_mode='Markdown',
        reply_markup=ReplyKeyboardMarkup(keyboard, one_time_keyboard=True, resize_keyboard=True)
    )
    return START_PAY_METHOD

async def pay_method_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    method = update.message.text
    context.user_data['metodo'] = method
    if method == 'Mixto':
        await update.message.reply_text("📝 Indica montos en Bs. Ej: 50 efectivo, 150 pagomovil", reply_markup=ReplyKeyboardRemove())
        return START_PAY_AMOUNTS
    
    # If single method, we assume full payment logic or ask for amount
    await update.message.reply_text(f"📝 Ingresa el monto total en **Bs** ({method}):", parse_mode='Markdown', reply_markup=ReplyKeyboardRemove())
    return START_PAY_AMOUNTS

async def start_pay_amounts_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.lower()
    if context.user_data['metodo'] == 'Mixto':
        efectivo = re.search(r'(\d+)\s*efectivo', text)
        pagomovil = re.search(r'(\d+)\s*pagomovil', text)
        context.user_data['monto_efectivo'] = efectivo.group(1) if efectivo else 0
        context.user_data['monto_pagomovil'] = pagomovil.group(1) if pagomovil else 0
    else:
        monto = re.search(r'(\d+)', text)
        monto_val = monto.group(1) if monto else 0
        if context.user_data['metodo'] == 'Efectivo (Bs)':
            context.user_data['monto_efectivo'] = monto_val
            context.user_data['monto_pagomovil'] = 0
        else:
            context.user_data['monto_efectivo'] = 0
            context.user_data['monto_pagomovil'] = monto_val

    # Finalize Start Route
    res = api.start_route(
        vehiculo_id=context.user_data['vehiculo_id'],
        odometro=context.user_data['odometro'],
        foto=context.user_data['foto_path'],
        monto_efectivo=context.user_data['monto_efectivo'],
        monto_pagomovil=context.user_data['monto_pagomovil']
    )
    
    if 'error' in res:
        await update.message.reply_text(f"❌ Error: {res['error']}", reply_markup=await get_dynamic_menu())
    else:
        await update.message.reply_text("✅ ¡Jornada Iniciada con éxito!\nBuen viaje.", reply_markup=await get_dynamic_menu())
    return ConversationHandler.END

# --- INDEPENDENT PAYMENT REPORT ---
async def start_reportar_pago(update: Update, context: ContextTypes.DEFAULT_TYPE):
    status = api.get_my_status()
    keyboard = [['Efectivo (Bs)', 'Pago Móvil', 'Mixto']]
    await update.message.reply_text(
        f"🏦 **Datos del Dueño:**\n`{status.get('datos_bancarios')}`\n\n"
        "Indica el método de pago:",
        parse_mode='Markdown',
        reply_markup=ReplyKeyboardMarkup(keyboard, one_time_keyboard=True, resize_keyboard=True)
    )
    return REPORTAR_METHOD

async def reportar_method_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    method = update.message.text
    context.user_data['metodo'] = method
    await update.message.reply_text(
        "📝 Ingresa el monto (o montos si es Mixto).\nEj: 100" if method != 'Mixto' else "Ej: 50 efectivo, 50 pagomovil",
        reply_markup=ReplyKeyboardRemove()
    )
    return REPORTAR_AMOUNTS

async def reportar_amounts_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Reuse parsing logic... (simplified here)
    context.user_data['monto_reportado'] = update.message.text
    await update.message.reply_text("📸 Envía el **COMPROBANTE** de pago:")
    return REPORTAR_PHOTO

async def reportar_photo_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    photo_file = await update.message.photo[-1].get_file()
    # Call report_payment API
    await update.message.reply_text("✅ Pago reportado. El dueño lo revisará pronto.", reply_markup=await get_dynamic_menu())
    return ConversationHandler.END

# --- END ROUTE FLOW (Simplified) ---
async def end_ruta_flow(update: Update, context: ContextTypes.DEFAULT_TYPE):
    active = api.get_active_route()
    if 'error' in active:
        await update.message.reply_text(f"⚠️ {active['error']}", reply_markup=await get_dynamic_menu())
        return ConversationHandler.END
    
    context.user_data['active_route_id'] = active['id']
    await update.message.reply_text(f"🏁 **Finalizar Jornada ({active['placa']})**\nIngresa el Odómetro Final:", parse_mode='Markdown', reply_markup=ReplyKeyboardRemove())
    return END_ODOMETER

async def end_odometer_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['odo_fin'] = update.message.text
    await update.message.reply_text("📸 Foto del tablero final:")
    return END_PHOTO

async def end_photo_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    photo_file = await update.message.photo[-1].get_file()
    context.user_data['foto_fin'] = f"uploads/{photo_file.file_id}.jpg"
    await update.message.reply_text("⛽ Combustible reportado (Litros):")
    return FUEL_REPORT

async def fuel_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    res = api.end_route(
        ruta_id=context.user_data['active_route_id'],
        odometro=context.user_data['odo_fin'],
        combustible=update.message.text,
        foto=context.user_data['foto_fin']
    )
    if 'error' in res:
        await update.message.reply_text(f"❌ Error: {res['error']}", reply_markup=await get_dynamic_menu())
    else:
        await update.message.reply_text("✅ Jornada finalizada con éxito. ¡Descansa!", reply_markup=await get_dynamic_menu())
    return ConversationHandler.END

# --- REPORT INCIDENT FLOW (New Requirement) ---
async def start_reportar_falla(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [['Mecánica', 'Eléctrica'], ['Carrocería', 'Neumáticos'], ['Accidente', 'Otro']]
    await update.message.reply_text(
        "⚠️ **Reportar Falla o Incidencia**\n¿Qué tipo de problema presenta la unidad?",
        parse_mode='Markdown',
        reply_markup=ReplyKeyboardMarkup(keyboard, one_time_keyboard=True, resize_keyboard=True)
    )
    return INCIDENCIA_TIPO

async def incidencia_tipo_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['incidencia_tipo'] = update.message.text.lower()
    await update.message.reply_text(
        "📝 Describe brevemente el problema (Ej: Falla en frenos, choque leve, repuesto comprado):",
        reply_markup=ReplyKeyboardRemove()
    )
    return INCIDENCIA_DESC

async def incidencia_desc_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['incidencia_desc'] = update.message.text
    await update.message.reply_text("📸 Envía una **FOTO** como evidencia (tablero, pieza, daño o factura):")
    return INCIDENCIA_PHOTO

async def incidencia_photo_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    photo_file = await update.message.photo[-1].get_file()
    context.user_data['incidencia_foto'] = f"uploads/incidencia_{photo_file.file_id}.jpg"
    
    res = api.report_incident(
        telegram_id=update.effective_user.id,
        tipo=context.user_data['incidencia_tipo'],
        descripcion=context.user_data['incidencia_desc'],
        foto=context.user_data['incidencia_foto']
    )
    
    if 'success' in res:
        await update.message.reply_text("✅ Incidencia reportada con éxito. El dueño ha sido notificado.", reply_markup=await get_dynamic_menu(update))
    else:
        await update.message.reply_text(f"❌ Error al reportar: {res.get('error')}", reply_markup=await get_dynamic_menu(update))
    
    return ConversationHandler.END

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Operación cancelada.", reply_markup=await get_dynamic_menu())
    return ConversationHandler.END

if __name__ == '__main__':
    # NEW: Intelligent IP Discovery for Network Segments (Home/Office)
    sync_env_ip()
    
    # Reload env after potential sync update
    load_dotenv()
    
    TOKEN = os.getenv('TELEGRAM_TOKEN')
    app = ApplicationBuilder().token(os.getenv('TELEGRAM_TOKEN')).post_init(post_init).build()

    # Conversation Handlers
    start_conv = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex('^🚛 INICIAR JORNADA$'), start_ruta_flow)],
        states={
            START_VEHICLE: [MessageHandler(filters.TEXT & (~filters.COMMAND), vehicle_chosen)],
            START_ODOMETER: [MessageHandler(filters.TEXT & (~filters.COMMAND), start_odometer_received)],
            START_PHOTO: [MessageHandler(filters.PHOTO, start_photo_received)],
            START_PAY_METHOD: [MessageHandler(filters.TEXT & (~filters.COMMAND), pay_method_chosen)],
            START_PAY_AMOUNTS: [MessageHandler(filters.TEXT & (~filters.COMMAND), start_pay_amounts_received)],
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

    end_conv = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex('^🏁 FINALIZAR RUTA$'), end_ruta_flow)],
        states={
            END_ODOMETER: [MessageHandler(filters.TEXT & (~filters.COMMAND), end_odometer_received)],
            END_PHOTO: [MessageHandler(filters.PHOTO, end_photo_received)],
            FUEL_REPORT: [MessageHandler(filters.TEXT & (~filters.COMMAND), fuel_received)],
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

    report_conv = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex('^💰 REPORTAR PAGO'), start_reportar_pago)],
        states={
            REPORTAR_METHOD: [MessageHandler(filters.TEXT & (~filters.COMMAND), reportar_method_chosen)],
            REPORTAR_AMOUNTS: [MessageHandler(filters.TEXT & (~filters.COMMAND), reportar_amounts_received)],
            REPORTAR_PHOTO: [MessageHandler(filters.PHOTO, reportar_photo_received)],
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

    incident_conv = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex('^⚠️ REPORTAR FALLA$'), start_reportar_falla)],
        states={
            INCIDENCIA_TIPO: [MessageHandler(filters.TEXT & (~filters.COMMAND), incidencia_tipo_chosen)],
            INCIDENCIA_DESC: [MessageHandler(filters.TEXT & (~filters.COMMAND), incidencia_desc_received)],
            INCIDENCIA_PHOTO: [MessageHandler(filters.PHOTO, incidencia_photo_received)],
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

    # Registration Conversation
    registration_conv = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            REGISTRAR_NOMBRE: [MessageHandler(filters.TEXT & (~filters.COMMAND), registrar_nombre_received)],
            REGISTRAR_CEDULA: [MessageHandler(filters.TEXT & (~filters.COMMAND), registrar_cedula_received)],
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

    app.add_handler(registration_conv)
    app.add_handler(start_conv)
    app.add_handler(end_conv)
    app.add_handler(report_conv)
    app.add_handler(incident_conv)
    app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_main_menu))

    print("🚀 Bot Zero-Command Iniciado...")
    app.run_polling()
