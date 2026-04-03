import os
import httpx # NEW: Robust Networking
import logging
import re
from telegram import Update, ReplyKeyboardMarkup, ReplyKeyboardRemove, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import (
    ApplicationBuilder, CommandHandler, MessageHandler, 
    filters, ConversationHandler, ContextTypes, CallbackQueryHandler
)
from dotenv import load_dotenv
from api_client import TuCooperativaAPI
from ip_sync import sync_env_ip # NEW: Auto-discovery

# WEB SERVER IMPORTS (Unified)
import uvicorn
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

load_dotenv()

# Logger Configuration
logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s', level=logging.INFO)
logging.getLogger('httpx').setLevel(logging.WARNING)
logger = logging.getLogger(__name__)

import requests
from api_client import TuCooperativaAPI

# API
api = TuCooperativaAPI()

# --- REALTIME HUB CORE (Unified) ---
app_web = FastAPI()

# Enable CORS (Crucial for cross-port communication)
app_web.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# --- AUTONOMOUS BCV MONITOR (MASTER FUSION) ---
BCV_RATE = 36.50

async def fetch_bcv_rate():
    global BCV_RATE
    url_bcv = "https://www.bcv.org.ve/"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    try:
        async with httpx.AsyncClient(timeout=15, verify=False, headers=headers) as client:
            resp = await client.get(url_bcv)
            if resp.status_code == 200:
                match = re.search(r'id="dolar".*?strong>\s*([\d,.]+)\s*</strong>', resp.text, re.S)
                if match:
                    new_rate = float(match.group(1).replace(',', '.'))
                    if new_rate > 10:
                        BCV_RATE = new_rate
                        logger.info(f"📁 Tasa Recuperada de BCV Directo: {BCV_RATE} Bs/$")
                        await sync_rate_to_backend(BCV_RATE)
                        await manager.broadcast({"type": "UPDATE_RATE", "rate": BCV_RATE})
                        return
    except Exception as e:
        logger.warning(f"⚠️ Error en Scraping Directo: {e}")

    # Fallback to DolarAPI
    try:
        async with httpx.AsyncClient(timeout=10, verify=False) as client:
            resp = await client.get("https://ve.dolarapi.com/v1/dolares/oficial")
            if resp.status_code == 200:
                data = resp.json()
                new_rate = data.get('promedio') or data.get('precio')
                if new_rate and float(new_rate) > 10:
                    BCV_RATE = float(new_rate)
                    logger.info(f"🔄 Tasa BCV Sincronizada (Fallback): {BCV_RATE} Bs/$")
                    await sync_rate_to_backend(BCV_RATE)
                    await manager.broadcast({"type": "UPDATE_RATE", "rate": BCV_RATE})
                    return
    except Exception as e:
        logger.warning(f"⚠️ Error en Fallback: {e}")

async def sync_rate_to_backend(rate):
    # Endpoint unificado para sincronización proactiva
    backend_url = f"{os.getenv('BACKEND_URL')}/system/update_config.php"
    try:
        async with httpx.AsyncClient() as client:
            await client.post(backend_url, json={"clave": "bcv_rate", "valor": str(rate)})
    except Exception as e:
        logger.error(f"❌ Error sincronizando tasa al backend: {e}")

async def bcv_worker_loop():
    while True:
        await fetch_bcv_rate()
        await asyncio.sleep(900) # Sincronización cada 15 minutos

class BroadcastMessage(BaseModel):
    type: str
    message: str = ""
    cooperativa_id: int = None

@app_web.post("/broadcast")
async def broadcast_endpoint(msg: BroadcastMessage):
    logger.info(f"📡 Broadcast Request: {msg.type} | Coop: {msg.cooperativa_id}")
    await manager.broadcast(msg.model_dump())
    return {"status": "success"}

@app_web.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def notify_realtime(type: str, message: str = "", coop_id: int = None):
    """Internal Broadcast (No HTTP needed anymore within same process)"""
    await manager.broadcast({
        "type": type,
        "message": message,
        "cooperativa_id": coop_id
    })

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
    REPORTAR_METHOD, REPORTAR_AMOUNTS, REPORTAR_REFERENCIA, REPORTAR_PHOTO,
    REGISTRAR_NOMBRE, REGISTRAR_CEDULA,
    INCIDENCIA_TIPO, INCIDENCIA_DESC, INCIDENCIA_ODOMETER, INCIDENCIA_PHOTO,
    REACTIVACION_PHOTO,
    END_PAY_METHOD, END_PAY_AMOUNTS,
    INCIDENCIA_PAY_METHOD, INCIDENCIA_PAY_AMOUNTS
) = range(23)


async def get_dynamic_menu(update: Update):
    """Build menu based on user role and driver's current status"""
    user_id = update.effective_user.id
    auth = api.check_authorization(user_id)
    
    if auth.get('status') != 'activo':
        return ReplyKeyboardRemove()

    role = auth.get('rol')
    if role in ['admin', 'dueno', 'owner']:
        keyboard = [['📊 RESUMEN COOPERATIVA'], ['🔔 ALERTAS CRÍTICAS', '🔧 SOPORTE']]
        return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    
    # Chofer Logic
    status = api.get_my_status()
    # Verificamos si la unidad está bloqueada por falla
    if status.get('estado_unidad') == 'mantenimiento':
        keyboard = [['✅ REPARACIÓN FINALIZADA'], ['📊 MI ESTADO / DEUDA'], ['🔧 AYUDA']]
        return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

    if status.get('ruta_activa'):
        main_button = '🏁 FINALIZAR RUTA'
    else:
        main_button = '🚛 INICIAR JORNADA'
    
    keyboard = [
        [main_button],
        ['💰 REPORTAR PAGO', '📊 MI DEUDA'],
        ['⚠️ REPORTAR FALLA', '🚐 MI UNIDAD']
    ]

    return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Entry point with dynamic menu and deep link handling"""
    user_id = update.effective_user.id
    
    # Check deep links first
    if context.args:
        token = context.args[0]
        if token.startswith('link_'):
            msg = "👑 ¡Vínculo de Dueño Exitoso!" if 'error' not in res else f"❌ Error: {res['error']}"
            await update.message.reply_text(msg, reply_markup=await get_dynamic_menu(update))
            
            if 'error' not in res:
                await notify_realtime("REFRESH_AUTH", "Dueño vinculado")
                
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

    # Plain /start logic
    auth = api.check_authorization(user_id)
    if auth.get('status') != 'activo':
        await update.message.reply_text(
            "🔒 **Acceso Restringido**\n\nNo tienes una cuenta activa en TuCooperativa. Para registrarte, por favor solicita un **Enlace de Invitación** a tu cooperativa o propietario.",
            parse_mode='Markdown',
            reply_markup=ReplyKeyboardRemove()
        )
        return ConversationHandler.END

    await update.message.reply_text(
        f"🚀 **Centro de Mando TuCooperativa**\nBienvenido, **{auth.get('nombre', 'Usuario')}**.\nSelecciona una opción del menú inferior.",
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
    
    if not res or 'error' in res:
        err = res.get('error', 'Error Desconocido') if res else 'Sin respuesta del servidor'
        await update.message.reply_text(f"❌ Error: {err}", reply_markup=await get_dynamic_menu(update))
    else:
        name = context.user_data.get('driver_nombre', 'Chofer')
        await update.message.reply_text(f"✅ ¡Registro Exitoso, {name}!\nYa puedes empezar a laborar.", reply_markup=await get_dynamic_menu(update))
    
    return ConversationHandler.END


async def handle_main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    if text == '🚛 INICIAR JORNADA':
        return await start_ruta_flow(update, context)
    elif text == '🏁 FINALIZAR RUTA':
        return await end_ruta_flow(update, context)
    elif text == '💰 REPORTAR PAGO':
        return await start_reportar_pago(update, context)
    elif text == '📊 MI DEUDA':
        status = api.get_my_status()
        if not status:
            await update.message.reply_text("❌ No se pudo obtener tu estado. Intenta más tarde.")
            return
        
        deuda_usd = float(status.get('deuda', 0))
        pendientes_usd = float(status.get('pendientes', 0))
        bcv_rate = float(status.get('bcv_rate', 1.0))
        
        deuda_bs = deuda_usd * bcv_rate
        
        msg = (
            f"📊 **Estado de Cuenta**\n\n"
            f"🚛 Unidad: `{status.get('placa', 'N/A')}`\n"
            f"💵 Deuda (USD): **${deuda_usd:.2f}**\n"
            f"🏦 Tasa BCV: **{bcv_rate:.2f} Bs/$**\n"
            f"🇻🇪 **Total en Bs: {deuda_bs:.2f}**\n\n"
            f"⏳ En Revisión: *${pendientes_usd:.2f}*\n"
            f"📍 Último KM: `{status.get('ultimo_km', '0')}`\n\n"
            f"📌 **Datos para Pago Móvil:**\n"
            f"{status.get('datos_bancarios', 'Consulte Admin')}"
        )
        await update.message.reply_text(msg, parse_mode='Markdown', reply_markup=await get_dynamic_menu(update))

    elif text == '🚐 MI UNIDAD':
        res = api.get_my_vehicle()
        if 'error' in res:
            await update.message.reply_text(f"❌ {res['error']}")
        else:
            status_val = res.get('estado', 'activo')
            status_label = "✅ OPERATIVO" if status_val == 'activo' else "🛠️ MANTENIMIENTO"
            
            msg = f"🚐 **Tu Unidad Asignada**\n\n"
            msg += f"🔹 Placa: *{res['placa']}*\n"
            msg += f"🔹 Estado: *{status_label}*\n"
            msg += f"🔹 Modelo: *{res['modelo']}*\n"
            msg += f"🔹 Año: *{res['anio']}*\n"
            msg += f"💰 Cuota Diaria: *${res['cuota_diaria']}*"
            await update.message.reply_text(msg, parse_mode='Markdown')

    elif text == '🔧 AYUDA':
        await update.message.reply_text("📱 Contacte al administrador central para soporte técnico.")

# --- START ROUTE FLOW (Zero-Command) ---
async def start_ruta_flow(update: Update, context: ContextTypes.DEFAULT_TYPE):
    vehicles = api.get_vehicles()
    if not vehicles:
        await update.message.reply_text("❌ **Acceso Denegado**\nNo tienes una unidad asignada por el dueño. Contacta a soporte.", parse_mode='Markdown')
        return ConversationHandler.END

    
    # Store vehicles for lookup
    context.user_data['vehicles_list'] = vehicles
    
    if len(vehicles) == 1:
        # Skip selection
        v = vehicles[0]
        context.user_data['placa'] = v['placa']
        context.user_data['vehiculo_id'] = v['id']
        await update.message.reply_text(
            f"📍 Unidad: *{v['placa']}*\nIngresa el **Odómetro Inicial** (solo números):", 
            parse_mode='Markdown', 
            reply_markup=ReplyKeyboardMarkup([['❌ CANCELAR']], resize_keyboard=True)
        )
        return START_ODOMETER

    keyboard = [[v['placa']] for v in vehicles]
    keyboard.append(['❌ CANCELAR'])
    await update.message.reply_text(
        "🚛 **Iniciar Jornada**\nSelecciona tu vehículo:",
        parse_mode='Markdown',
        reply_markup=ReplyKeyboardMarkup(keyboard, one_time_keyboard=True, resize_keyboard=True)
    )
    return START_VEHICLE


async def vehicle_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    placa = update.message.text
    if placa == '❌ CANCELAR': return await cancel(update, context)
    context.user_data['placa'] = placa
    
    # Find vehicle_id dynamically
    vehicles = context.user_data.get('vehicles_list', [])
    v_id = next((v['id'] for v in vehicles if v['placa'] == placa), None)
    
    if not v_id:
        await update.message.reply_text("❌ Vehículo no encontrado. Intenta de nuevo.", reply_markup=await get_dynamic_menu(update))
        return ConversationHandler.END
        
    context.user_data['vehiculo_id'] = v_id
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
    
    # Finalize Start Route (NO payment here anymore)
    res = api.start_route(
        vehiculo_id=context.user_data['vehiculo_id'],
        odometro=context.user_data['odometro'],
        foto=context.user_data['foto_path']
    )
    
    if 'error' in res:
        await update.message.reply_text(f"❌ Error: {res['error']}", reply_markup=await get_dynamic_menu(update))
    else:
        await update.message.reply_text("✅ ¡Jornada Iniciada con éxito!\nBuen viaje.", reply_markup=await get_dynamic_menu(update))
    return ConversationHandler.END


# --- INDEPENDENT PAYMENT REPORT ---
async def start_reportar_pago(update: Update, context: ContextTypes.DEFAULT_TYPE):
    status = api.get_my_status() or {}
    keyboard = [['Efectivo (Bs)', 'Pago Móvil', 'Mixto']]
    await update.message.reply_text(
        f"🏦 **Datos del Dueño:**\n`{status.get('datos_bancarios', 'Consulte Admin')}`\n\n"
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
    text = update.message.text.lower()
    m_efectivo = 0
    m_pagomovil = 0
    
    if context.user_data.get('metodo') == 'Mixto':
        ef_match = re.search(r'(\d+)\s*efectivo', text)
        pm_match = re.search(r'(\d+)\s*pagomovil', text)
        m_efectivo = ef_match.group(1) if ef_match else 0
        m_pagomovil = pm_match.group(1) if pm_match else 0
    else:
        monto_match = re.search(r'(\d+)', text)
        monto_val = monto_match.group(1) if monto_match else 0
        if context.user_data.get('metodo') == 'Efectivo (Bs)':
            m_efectivo = monto_val
        else:
            m_pagomovil = monto_val

    context.user_data['m_efectivo'] = m_efectivo
    context.user_data['m_pagomovil'] = m_pagomovil

    if m_pagomovil > 0:
        await update.message.reply_text("🔢 Ingresa los **ÚLTIMOS 4 DÍGITOS** de la referencia de Pago Móvil:", parse_mode='Markdown')
        return REPORTAR_REFERENCIA
    else:
        await update.message.reply_text("📸 Envía el **COMPROBANTE** (Foto) o presiona /saltar:", parse_mode='Markdown')
        return REPORTAR_PHOTO

async def reportar_referencia_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['referencia'] = update.message.text[-4:]
    keyboard = [['⏭️ SALTAR FOTO', '❌ CANCELAR']]
    await update.message.reply_text(
        "📸 Opcional: Envía el **COMPROBANTE** (Foto) o presiona el botón para saltar:", 
        parse_mode='Markdown',
        reply_markup=ReplyKeyboardMarkup(keyboard, one_time_keyboard=True, resize_keyboard=True)
    )
    return REPORTAR_PHOTO

async def reportar_photo_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text if update.message.text else ""
    if text == '❌ CANCELAR': return await cancel(update, context)
    
    photo_file = None
    if update.message.photo:
        photo = await update.message.photo[-1].get_file()
        photo_file = f"uploads/pago_{photo.file_id}.jpg"
    
    # Check if user pressed the Skip button
    if text == '⏭️ SALTAR FOTO':
        photo_file = None
    
    res = api.report_payment(
        monto_efectivo=context.user_data.get('m_efectivo', 0),
        monto_pagomovil=context.user_data.get('m_pagomovil', 0),
        referencia=context.user_data.get('referencia', ''),
        foto=photo_file or ''
    )
    
    if 'error' in res:
        await update.message.reply_text(f"❌ Error: {res['error']}", reply_markup=await get_dynamic_menu(update))
    else:
        await notify_realtime("REFRESH_FLEET", "Pago reportado")
        await update.message.reply_text("✅ Pago reportado con éxito. El dueño ha sido notificado.", reply_markup=await get_dynamic_menu(update))
    
    return ConversationHandler.END

async def skip_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    return await reportar_photo_received(update, context)

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
    context.user_data['fuel_qty'] = update.message.text
    context.user_data['next_state'] = END_PAY_AMOUNTS
    
    # Instead of ending, ask for payment
    status = api.get_my_status() or {}
    deuda_usd = float(status.get('deuda', 0))
    bcv_rate = float(status.get('bcv_rate', 1.0))
    deuda_bs = deuda_usd * bcv_rate
    
    telf = status.get('banco_telefono', 'N/A')
    rif = status.get('banco_identidad', 'N/A')
    
    bank_msg = (
        f"🏁 **Jornada Finalizada.**\n\n"
        f"💵 Cuota Pendiente: **${deuda_usd:.2f}**\n"
        f"🏦 Tasa BCV: **{bcv_rate:.2f} Bs/$**\n"
        f"🇻🇪 **Total a pagar hoy: {deuda_bs:.2f} Bs**\n\n"
        f"🏦 **DATOS PAGO MÓVIL:**\n"
        f"📱 Telf: `{telf}`\n"
        f"🆔 RIF/CI: `{rif}`\n"
    )

    keyboard = [['Efectivo (Bs)', 'Pago Móvil', 'Mixto']]
    await update.message.reply_text(
        bank_msg + "\n💰 Reporta el abono de hoy:",
        parse_mode='Markdown',
        reply_markup=ReplyKeyboardMarkup(keyboard, one_time_keyboard=True, resize_keyboard=True)
    )
    return END_PAY_METHOD


# --- REPORT INCIDENT FLOW ---
async def start_reportar_falla(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [['Mecánica', 'Eléctrica'], ['Carrocería', 'Neumáticos'], ['Accidente', 'Otro'], ['❌ CANCELAR']]
    await update.message.reply_text(
        "⚠️ **Reportar Falla o Incidencia**\n¿Qué tipo de problema presenta la unidad?",
        parse_mode='Markdown',
        reply_markup=ReplyKeyboardMarkup(keyboard, one_time_keyboard=True, resize_keyboard=True)
    )
    return INCIDENCIA_TIPO


async def incidencia_tipo_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    tipo = update.message.text
    if tipo == '❌ CANCELAR': return await cancel(update, context)
    context.user_data['incidencia_tipo'] = tipo.lower()
    await update.message.reply_text(
        "📝 Describe brevemente el problema:",
        reply_markup=ReplyKeyboardMarkup([['❌ CANCELAR']], resize_keyboard=True)
    )
    return INCIDENCIA_DESC


async def incidencia_desc_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    desc = update.message.text
    if desc == '❌ CANCELAR': return await cancel(update, context)
    context.user_data['incidencia_desc'] = desc
    await update.message.reply_text("📍 Ingresa el **Odómetro Actual** (solo números):", parse_mode='Markdown', reply_markup=ReplyKeyboardMarkup([['❌ CANCELAR']], resize_keyboard=True))
    return INCIDENCIA_ODOMETER

async def incidencia_odometer_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    odo = update.message.text
    if odo == '❌ CANCELAR': return await cancel(update, context)
    if not odo.isdigit():
        await update.message.reply_text("⚠️ Solo números por favor.")
        return INCIDENCIA_ODOMETER
    context.user_data['incidencia_odo'] = odo
    await update.message.reply_text("📸 Envía una **FOTO** como evidencia:")
    return INCIDENCIA_PHOTO


async def incidencia_photo_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    photo_file = await update.message.photo[-1].get_file()
    context.user_data['incidencia_foto'] = f"uploads/incidencia_{photo_file.file_id}.jpg"
    
    res = api.report_incident(
        telegram_id=update.effective_user.id,
        tipo=context.user_data['incidencia_tipo'],
        descripcion=context.user_data['incidencia_desc'],
        odometro=context.user_data['incidencia_odo'],
        foto=context.user_data['incidencia_foto']
    )
    
    if 'success' in res:
        await notify_realtime("REFRESH_INCIDENTS", "Falla reportada")
        rid = res.get('ruta_id')
        context.user_data['active_route_id'] = rid
        context.user_data['next_state'] = INCIDENCIA_PAY_AMOUNTS
        suggested = res.get('suggested_quota', 0)
        owner_chat_id = res.get('owner_chat_id')
        placa = res.get('vehiculo_placa')
        
        # NOTIFY OWNER with Exonerate Button
        if owner_chat_id:
            keyboard = [
                [InlineKeyboardButton("💸 EXONERAR PAGO DE HOY", callback_data=f"exon_{rid}")],
                [InlineKeyboardButton("🚫 NO EXONERAR (Cobro Normal)", callback_data=f"noexon_{rid}")]
            ]
            await context.bot.send_message(
                chat_id=owner_chat_id,
                text=f"🚨 **REPORTE DE FALLA - {placa}**\n\n"
                     f"El chofer {update.effective_user.first_name} reportó una falla: *{context.user_data['incidencia_desc']}*\n"
                     f"La unidad ha sido bloqueada. ¿Deseas exonerar el pago de hoy?",
                parse_mode='Markdown',
                reply_markup=InlineKeyboardMarkup(keyboard)
            )

        
        status = api.get_my_status()
        keyboard = [['Efectivo (Bs)', 'Pago Móvil', 'Mixto']]
        await update.message.reply_text(
            f"⚠️ **Unidad Bloqueada.**\n"
            f"💵 **Cuota Sugerida (Parcial):** {suggested} Bs\n\n"
            "Indica cómo reportarás lo producido hoy:",
            parse_mode='Markdown',
            reply_markup=ReplyKeyboardMarkup(keyboard, one_time_keyboard=True, resize_keyboard=True)
        )
        return INCIDENCIA_PAY_METHOD

    else:
        await update.message.reply_text(f"❌ Error: {res.get('error')}", reply_markup=await get_dynamic_menu(update))
        return ConversationHandler.END


# --- REACTIVATION FLOW ---
async def start_reactivacion_flow(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🛠️ **Cierre de Mantenimiento**\nEnvía una **FOTO** del trabajo realizado:",
        parse_mode='Markdown',
        reply_markup=ReplyKeyboardRemove()
    )
    return REACTIVACION_PHOTO

async def process_final_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.lower()
    efectivo = 0
    pagomovil = 0
    
    if context.user_data.get('metodo') == 'Mixto':
        ef_match = re.search(r'(\d+)\s*efectivo', text)
        pm_match = re.search(r'(\d+)\s*pagomovil', text)
        efectivo = ef_match.group(1) if ef_match else 0
        pagomovil = pm_match.group(1) if pm_match else 0
    else:
        monto_match = re.search(r'(\d+)', text)
        monto_val = monto_match.group(1) if monto_match else 0
        
        # Double check if we got a valid number
        if not monto_val:
            await update.message.reply_text("⚠️ No entendí el monto. Por favor ingresa solo el número (ej: 50).")
            return context.user_data.get('next_state')

        if context.user_data.get('metodo') == 'Efectivo (Bs)':
            efectivo = monto_val
        else:
            pagomovil = monto_val


    # Determine if it's a normal end or breakdown
    if 'incidencia_tipo' in context.user_data:
        res = api.end_route(
            ruta_id=context.user_data.get('active_route_id'),
            odometro=None,
            combustible=0,
            foto=None,
            monto_efectivo=efectivo,
            monto_pagomovil=pagomovil
        )
        msg = "✅ Incidencia y abono reportados. Unidad BLOQUEADA."
    else:
        res = api.end_route(
            ruta_id=context.user_data.get('active_route_id'),
            odometro=context.user_data.get('odo_fin'),
            combustible=context.user_data.get('fuel_qty'),
            foto=context.user_data.get('foto_fin'),
            monto_efectivo=efectivo,
            monto_pagomovil=pagomovil
        )
        msg = "✅ Jornada finalizada y abono reportado. ¡Descansa!"
        await notify_realtime("REFRESH_FLEET", "Jornada finalizada")

    await update.message.reply_text(msg, reply_markup=await get_dynamic_menu(update))
    return ConversationHandler.END

async def final_payment_method_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data['metodo'] = update.message.text
    await update.message.reply_text("📝 Ingresa el monto (Bs):", reply_markup=ReplyKeyboardRemove())
    return context.user_data.get('next_state')

async def reportar_method_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    method = update.message.text
    if method == '❌ CANCELAR': return await cancel(update, context)
    context.user_data['pay_method'] = method

    await update.message.reply_text("📝 Ingresa el monto (Bs):", reply_markup=ReplyKeyboardRemove())
    return context.user_data.get('next_state')

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Operación cancelada.", reply_markup=await get_dynamic_menu(update))
    return ConversationHandler.END

async def start_reactivacion_flow(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🛠️ **PROCESO DE REACTIVACIÓN**\n\nPor favor, sube una foto de la reparación o repuesto instalado:", reply_markup=ReplyKeyboardRemove())

async def reactivacion_photo_received(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message.photo:
        return
    res = api.reactivate_vehicle(update.effective_user.id)
    if 'success' in res:
        await notify_realtime("REFRESH_FLEET", "Unidad reactivada")
        await update.message.reply_text("✅ **UNIDAD REACTIVADA.**\n\nYa puedes iniciar una nueva jornada.", reply_markup=await get_dynamic_menu(update))
    else:
        await update.message.reply_text(f"❌ Error: {res.get('error')}", reply_markup=await get_dynamic_menu(update))

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    if query.data.startswith('exon_'):
        rid = query.data.split('_')[1]
        res = api.exonerate_route(rid)
        if 'success' in res:
            await notify_realtime("REFRESH_FLEET", "Pago exonerado")
            await query.edit_message_text(text=f"{query.message.text}\n\n✅ **PAGO EXONERADO POR EL DUEÑO.**")
        else:
            await query.edit_message_text(text=f"{query.message.text}\n\n❌ Error: {res.get('error')}")
    elif query.data.startswith('noexon_'):
        await query.edit_message_text(text=f"{query.message.text}\n\n🚫 **COBRO MANTENIDO (No se exoneró).**")


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Log the error and send a telegram message to notify the developer."""
    logger.error(msg="Exception while handling an update:", exc_info=context.error)
    
    # Notify user
    if isinstance(update, Update) and update.effective_message:
        text = "❌ **Error Crítico en el Sistema.**\n\nSe ha notificado al soporte técnico. Intenta de nuevo en unos minutos."
        await update.effective_message.reply_text(text, parse_mode='Markdown')

if __name__ == '__main__':
    sync_env_ip()
    load_dotenv()
    
    app = ApplicationBuilder().token(os.getenv('TELEGRAM_TOKEN')).post_init(post_init).build()

    # 1. Start Journey
    start_conv = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex('^🚛 INICIAR JORNADA$'), start_ruta_flow)],
        states={
            START_VEHICLE: [MessageHandler(filters.TEXT & (~filters.COMMAND), vehicle_chosen)],
            START_ODOMETER: [MessageHandler(filters.TEXT & (~filters.COMMAND), start_odometer_received)],
            START_PHOTO: [MessageHandler(filters.PHOTO, start_photo_received)],
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

    # 2. End Journey
    end_conv = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex('^🏁 FINALIZAR RUTA$'), end_ruta_flow)],
        states={
            END_ODOMETER: [MessageHandler(filters.TEXT & (~filters.COMMAND), end_odometer_received)],
            END_PHOTO: [MessageHandler(filters.PHOTO, end_photo_received)],
            FUEL_REPORT: [MessageHandler(filters.TEXT & (~filters.COMMAND), fuel_received)],
            END_PAY_METHOD: [MessageHandler(filters.TEXT & (~filters.COMMAND), final_payment_method_chosen)],
            END_PAY_AMOUNTS: [MessageHandler(filters.TEXT & (~filters.COMMAND), process_final_payment)],
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

    # 3. Incident
    incident_conv = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex('^⚠️ REPORTAR FALLA$'), start_reportar_falla)],
        states={
            INCIDENCIA_TIPO: [MessageHandler(filters.TEXT & (~filters.COMMAND), incidencia_tipo_chosen)],
            INCIDENCIA_DESC: [MessageHandler(filters.TEXT & (~filters.COMMAND), incidencia_desc_received)],
            INCIDENCIA_ODOMETER: [MessageHandler(filters.TEXT & (~filters.COMMAND), incidencia_odometer_received)],
            INCIDENCIA_PHOTO: [MessageHandler(filters.PHOTO, incidencia_photo_received)],
            INCIDENCIA_PAY_METHOD: [MessageHandler(filters.TEXT & (~filters.COMMAND), final_payment_method_chosen)],
            INCIDENCIA_PAY_AMOUNTS: [MessageHandler(filters.TEXT & (~filters.COMMAND), process_final_payment)],
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

    # 4. Independent Payment
    report_conv = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex('^💰 REPORTAR PAGO'), start_reportar_pago)],
        states={
            REPORTAR_METHOD: [MessageHandler(filters.TEXT & (~filters.COMMAND), reportar_method_chosen)],
            REPORTAR_AMOUNTS: [MessageHandler(filters.TEXT & (~filters.COMMAND), reportar_amounts_received)],
            REPORTAR_REFERENCIA: [MessageHandler(filters.TEXT & (~filters.COMMAND), reportar_referencia_received)],
            REPORTAR_PHOTO: [
                MessageHandler(filters.PHOTO, reportar_photo_received),
                MessageHandler(filters.Regex('^⏭️ SALTAR FOTO$'), reportar_photo_received),
                CommandHandler('saltar', skip_photo) # Keep for compatibility
            ],
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

    app.add_handler(start_conv)
    app.add_handler(end_conv)
    app.add_handler(incident_conv)
    app.add_handler(report_conv)
    app.add_handler(ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            REGISTRAR_NOMBRE: [MessageHandler(filters.TEXT & (~filters.COMMAND), registrar_nombre_received)],
            REGISTRAR_CEDULA: [MessageHandler(filters.TEXT & (~filters.COMMAND), registrar_cedula_received)],
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    ))
    
    app.add_handler(CallbackQueryHandler(handle_callback))
    app.add_handler(MessageHandler(filters.Regex('^✅ REPARACIÓN FINALIZADA$'), start_reactivacion_flow))
    app.add_handler(MessageHandler(filters.PHOTO, reactivacion_photo_received))
    app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_main_menu))

    app.add_error_handler(error_handler)
    
    print("🚀 Fusión Maestra: Bot + Realtime Hub Iniciados en el puerto 8000")
    
    # 1. Configurar Uvicorn con mayor tolerancia a latencia
    config = uvicorn.Config(
        app=app_web, 
        host="0.0.0.0", 
        port=8000, 
        log_level="warning",
        ws_ping_interval=30, # Mayor tiempo entre pings
        ws_ping_timeout=30   # Mayor tiempo de espera antes de cerrar
    )
    server = uvicorn.Server(config)
    
    # 2. Correr ambos loops juntos usando asyncio
    async def main():
        # Iniciamos el Bot de forma asíncrona
        await app.initialize()
        await app.start()
        await app.updater.start_polling()
        
        # Iniciamos el Servidor Web (Realtime) con captura de errores de red
        asyncio.create_task(bcv_worker_loop()) # Start the Autonomous Worker
        while True:
            try:
                await server.serve()
                break # Si termina normal, salimos
            except OSError as e:
                if e.errno == 121: 
                    logger.warning("⚠️ Error 121 (Timeout) detectado. Reiniciando Hub en 2s...")
                    await asyncio.sleep(2)
                else: raise e
            except Exception as e:
                logger.error(f"🔥 Fallo crítico en Hub: {e}")
                await asyncio.sleep(5)
        
        # Al terminar (shutdown)
        await app.updater.stop()
        await app.stop()
        await app.shutdown()

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("👋 Servicio apagado correctamente.")


