import os
import logging
from telegram import Update, ReplyKeyboardMarkup, ReplyKeyboardRemove
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ConversationHandler, ContextTypes
from dotenv import load_dotenv
from api_client import TuCooperativaAPI

load_dotenv()

# Logger
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)

# API
api = TuCooperativaAPI()

# Conversation states
CHOOSING_VEHICLE, ODOMETER_VALUE, ODOMETER_PHOTO, PAYMENT_METHOD, PAYMENT_AMOUNTS = range(5)

def get_main_menu():
    keyboard = [['🚛 Nueva Ruta', '💰 Ver Pagos'], ['🔧 Soporte']]
    return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Link account or handle Deep Link"""
    if context.args and len(context.args) > 0:
        token = context.args[0]
        res = api.register_via_token(token, update.effective_user.id, update.effective_user.first_name)
        if 'error' in res:
            await update.message.reply_text(f"❌ Error de registro: {res['error']}")
        else:
            await update.message.reply_text(
                f"✅ ¡Registro Exitoso!\nTu cuenta ha sido vinculada.\nUsa el menú inferior para comenzar.",
                reply_markup=get_main_menu()
            )
        return

    await update.message.reply_text(
        "🚀 Bienvenido a TuCooperativaBot.\n\n"
        "Si tienes un link de invitación, por favor ábrelo para registrarte automáticamente.",
        reply_markup=get_main_menu()
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    if text == '🚛 Nueva Ruta':
        return await start_ruta_flow(update, context)
    elif text == '💰 Ver Pagos':
        await update.message.reply_text("💵 Su balance actual es: $0.00\nPróximamente verás tu historial aquí.")
    elif text == '🔧 Soporte':
        await update.message.reply_text("📱 Contacte a TransMonagas al: +58 4XX-XXXXXXX para asistencia.")
    else:
        await update.message.reply_text("❓ Por favor use los botones del menú inferior.")

async def link_account(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Sync bot with backend account"""
    args = context.args
    if len(args) < 2:
        await update.message.reply_text("Uso: /link [email] [clave]")
        return

    email, password = args[0], args[1]
    res = api.login(email, password)

    if 'error' in res:
        await update.message.reply_text(f"❌ Error de vinculación: {res['error']}")
    else:
        # After login, link the Telegram ID
        link_res = api.link_telegram(update.effective_user.id)
        if 'error' in link_res:
             await update.message.reply_text(f"⚠️ Login OK, pero falló vinculación de ID: {link_res['error']}")
        else:
             await update.message.reply_text(f"✅ ¡Vinculación Exitosa!\nBienvenido {res['user']['nombre']}.\nUsa /ruta para iniciar tu jornada.")

async def start_ruta_flow(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Initial step for route registration"""
    # Fetch vehicles from API
    vehicles = api.get_vehicles()
    if not vehicles or 'error' in vehicles:
        await update.message.reply_text("❌ No se pudieron cargar los vehículos. Asegúrate de estar vinculado.")
        return ConversationHandler.END

    keyboard = [[v['placa']] for v in vehicles]
    reply_markup = ReplyKeyboardMarkup(keyboard, one_time_keyboard=True, resize_keyboard=True)
    
    await update.message.reply_text("🚛 Selecciona el vehículo para esta ruta:", reply_markup=reply_markup)
    return CHOOSING_VEHICLE

async def vehicle_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['placa'] = update.message.text
    # In a real app, find ID from placa. For now, assume ID=1.
    context.user_data['vehiculo_id'] = 1 
    
    await update.message.reply_text(
        f"📍 Vehículo: {update.message.text}\n"
        "Indica el valor actual del odómetro (solo números):",
        reply_markup=ReplyKeyboardRemove()
    )
    return ODOMETER_VALUE

async def odometer_value_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message.text.isdigit():
        await update.message.reply_text("⚠️ Por favor, ingresa solo números.")
        return ODOMETER_VALUE
    
    context.user_data['odometro'] = update.message.text
    await update.message.reply_text("📸 Ahora, envía una FOTO del tablero del odómetro para validación:")
    return ODOMETER_PHOTO

async def photo_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    photo_file = await update.message.photo[-1].get_file()
    context.user_data['foto_path'] = f"uploads/{photo_file.file_id}.jpg"
    
    # New: Ask for Payment Method
    keyboard = [['Efectivo', 'Pago Móvil', 'Ambos']]
    reply_markup = ReplyKeyboardMarkup(keyboard, one_time_keyboard=True, resize_keyboard=True)
    
    await update.message.reply_text(
        "💰 ¡Foto recibida! Ahora, ¿qué método de pago usarás para la cuota diaria?",
        reply_markup=reply_markup
    )
    return PAYMENT_METHOD

async def payment_method_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    method = update.message.text
    context.user_data['metodo'] = method
    
    if method == 'Ambos':
        await update.message.reply_text(
            "📝 Indica los montos divididos.\n"
            "Ejemplo: 5 efectivo, 10 pagomovil"
        )
        return PAYMENT_AMOUNTS
    
    return await finalize_route(update, context)

async def payment_amounts_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.lower()
    # Simple parsing: find numbers after keywords
    import re
    efectivo = re.search(r'(\d+)\s*efectivo', text)
    pagomovil = re.search(r'(\d+)\s*pagomovil', text)
    
    context.user_data['monto_efectivo'] = efectivo.group(1) if efectivo else 0
    context.user_data['monto_pagomovil'] = pagomovil.group(1) if pagomovil else 0
    
    return await finalize_route(update, context)

async def finalize_route(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Check Gatekeeper before final submission
    auth = api.check_authorization(update.effective_user.id)
    if 'error' in auth or auth.get('status') != 'activo':
        await update.message.reply_text("❌ Acceso Denegado: Su cuenta o empresa está suspendida.")
        return ConversationHandler.END

    res = api.start_route(
        vehiculo_id=context.user_data['vehiculo_id'],
        odometro=context.user_data['odometro'],
        foto=context.user_data['foto_path'],
        monto_efectivo=context.user_data.get('monto_efectivo', 0),
        monto_pagomovil=context.user_data.get('monto_pagomovil', 0)
    )

    if 'error' in res:
        await update.message.reply_text(f"❌ Error: {res['error']}")
    else:
        await update.message.reply_text(
            "✅ ¡Operación Completada!\n"
            "Gracias por reportar tu jornada. ¡Feliz día!",
            reply_markup=ReplyKeyboardRemove()
        )
    return ConversationHandler.END

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Operación cancelada.", reply_markup=ReplyKeyboardRemove())
    return ConversationHandler.END

if __name__ == '__main__':
    TOKEN = os.getenv('TELEGRAM_TOKEN')
    app = ApplicationBuilder().token(TOKEN).build()

    # Route Conversation
    route_conv = ConversationHandler(
        entry_points=[CommandHandler('ruta', start_ruta_flow)],
        states={
            CHOOSING_VEHICLE: [MessageHandler(filters.TEXT & (~filters.COMMAND), vehicle_chosen)],
            ODOMETER_VALUE: [MessageHandler(filters.TEXT & (~filters.COMMAND), odometer_value_received)],
            ODOMETER_PHOTO: [MessageHandler(filters.PHOTO, photo_received)],
            PAYMENT_METHOD: [MessageHandler(filters.TEXT & (~filters.COMMAND), payment_method_chosen)],
            PAYMENT_AMOUNTS: [MessageHandler(filters.TEXT & (~filters.COMMAND), payment_amounts_received)],
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("link", link_account))
    app.add_handler(route_conv)
    app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_message))

    print("🚀 Bot TuCooperativa iniciado...")
    app.run_polling()
