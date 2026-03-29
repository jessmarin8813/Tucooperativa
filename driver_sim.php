<?php
/**
 * TuCooperativa - SIMULADOR DE CHOFER (VIRTUAL)
 * Este archivo permite emular las acciones del Bot de Telegram desde la web.
 * Útil para pruebas simultáneas con una sola cuenta de Telegram.
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Driver Sim | TuCooperativa</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0a0b12;
            --glass: rgba(255, 255, 255, 0.03);
            --primary: #6366f1;
            --accent: #06b6d4;
            --success: #10b981;
            --danger: #ef4444;
            --text-main: #ffffff;
            --text-dim: rgba(255, 255, 255, 0.5);
        }

        body {
            margin: 0;
            padding: 20px;
            font-family: 'Outfit', sans-serif;
            background: var(--bg);
            color: var(--text-main);
            display: flex;
            justify-content: center;
            min-height: 100vh;
        }

        .container {
            width: 100%;
            max-width: 450px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .glass {
            background: var(--glass);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 32px;
            padding: 32px;
        }

        .neon-text {
            background: linear-gradient(135deg, var(--primary), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 900;
        }

        h1 { margin: 0; font-size: 2.5rem; text-align: center; }
        p { margin: 10px 0 0; font-size: 0.9rem; color: var(--text-dim); text-align: center; }

        .btn {
            width: 100%;
            padding: 18px;
            border-radius: 16px;
            border: none;
            font-family: inherit;
            font-weight: 800;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 10px;
            text-transform: uppercase;
        }

        .btn-primary { background: var(--primary); color: white; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
        .btn-success { background: var(--success); color: white; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2); }
        .btn-danger { background: var(--danger); color: white; }

        input {
            width: 100%;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(0,0,0,0.2);
            color: white;
            font-family: inherit;
            box-sizing: border-box;
            margin-top: 8px;
            font-size: 1.1rem;
        }

        label { font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-dim); }

        .card-driver {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 20px;
        }

        .status-badge {
            padding: 6px 12px;
            border-radius: 100px;
            font-size: 0.7rem;
            font-weight: 900;
            text-transform: uppercase;
        }

        .hidden { display: none !important; }
        
        .log {
            font-family: monospace;
            font-size: 0.8rem;
            background: black;
            padding: 15px;
            border-radius: 12px;
            height: 150px;
            overflow-y: auto;
            color: #0f0;
            border: 1px solid #030;
        }

        .bot-menu {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
        }

        .bot-msg {
            background: rgba(255,255,255,0.05);
            border-left: 4px solid var(--primary);
            padding: 15px;
            border-radius: 0 16px 16px 16px;
            font-size: 0.9rem;
            line-height: 1.4;
            margin-bottom: 20px;
            white-space: pre-wrap;
        }

        .grace-alert {
            background: rgba(245, 158, 11, 0.1);
            border: 1px dashed #f59e0b;
            padding: 15px;
            border-radius: 16px;
            margin-bottom: 15px;
            font-size: 0.85rem;
            color: #f59e0b;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .timer-box {
            font-weight: 900;
            font-size: 1.2rem;
            background: rgba(245, 158, 11, 0.2);
            padding: 4px 10px;
            border-radius: 8px;
        }

        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
    </style>
</head>
<body>

<div class="container">
    <div class="glass">
        <h1 class="neon-text">Driver SIM</h1>
        <p>Emulador de Chofer Virtual v1.0</p>
    </div>

    <!-- PESTAÑA: SELECCIÓN / LOGIN -->
    <div id="view-mode-selector" class="glass">
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <button onclick="switchMode('reg')" class="btn" id="tab-reg" style="flex: 1; background: var(--primary);">NUEVO REGISTRO</button>
            <button onclick="switchMode('login')" class="btn" id="tab-login" style="flex: 1; background: rgba(255,255,255,0.05);">LOGIN EXISTENTE</button>
        </div>

        <div id="mode-reg" class="">
            <div style="margin-bottom: 20px;">
                <label>Token de Invitación</label>
                <input type="text" id="token-input" placeholder="Pegar token aquí...">
            </div>
            <div style="margin-bottom: 20px;">
                <label>Nombre del Chofer (Virtual)</label>
                <input type="text" id="name-input" placeholder="Ej: Chofer de Pruebas">
            </div>
            <div style="margin-bottom: 20px;">
                <label>Cédula</label>
                <input type="text" id="cedula-input" placeholder="Ej: 12345678">
            </div>
            <button onclick="registerDriver()" class="btn btn-primary" id="btn-reg">Vincular SIM a Cooperativa</button>
        </div>

        <div id="mode-login" class="hidden">
            <div style="margin-bottom: 20px;">
                <label>Cédula del Chofer</label>
                <input type="text" id="login-cedula" placeholder="Ej: 12345678">
            </div>
            <p style="text-align: left; margin: 0 0 20px; font-size: 0.8rem;">Se buscará el chofer en la base de datos para iniciar la simulación.</p>
            <button onclick="loginExistingDriver()" class="btn btn-success" id="btn-login">Cargar Datos de Chofer</button>
        </div>

        <div id="registration-preview" class="glass hidden" style="margin-top: 20px; border: 1px solid var(--accent); background: rgba(6, 182, 212, 0.05);">
            <p class="text-dim uppercase font-black" style="font-size: 10px; margin-bottom: 8px;">Invitación Detectada</p>
            <h3 id="preview-coop" style="margin: 0; font-size: 1.2rem;">Cooperativa</h3>
            <div id="preview-unit-box" style="margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.05); borderRadius: 12px; display: inline-block;">
                <span style="font-size: 0.7rem; color: var(--text-dim); display: block; text-transform: uppercase;">Unidad Asignada</span>
                <span id="preview-unit" style="font-weight: 900; color: var(--accent);">PLACA-000</span>
            </div>
        </div>
    </div>

    <!-- PESTAÑA: PANEL DE CONTROL -->
    <div id="view-panel" class="glass hidden">
        <div class="card-driver">
            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.05); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem;">🚛</div>
            <div style="flex: 1;">
                <h2 id="driver-name" style="margin: 0; font-size: 1.4rem;">Nombre Chofer</h2>
                <div id="driver-status" class="status-badge" style="background: rgba(255,255,255,0.1); display: inline-block; margin-top: 5px;">Offline</div>
            </div>
            <button onclick="logout()" class="btn" style="width: auto; padding: 10px 15px; font-size: 0.7rem; background: rgba(239, 68, 68, 0.1); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.2);">CERRAR SESIÓN</button>
        </div>

        <div id="bot-response" class="bot-msg hidden"></div>

        <!-- ALERTA DE GRACIA -->
        <div id="grace-period-box" class="grace-alert hidden">
            <div class="timer-box" id="grace-timer">90:00</div>
            <div id="grace-msg">
                <strong>PERIODO DE GRACIA (90 MIN)</strong><br>
                Reporta la reparación antes de que expire el tiempo.
            </div>
        </div>

        <div class="bot-menu">
            <button onclick="showStatus()" class="btn btn-primary" style="background: #3b82f6; font-size: 0.8rem;">📊 MI DEUDA</button>
            <button onclick="showUnit()" class="btn btn-primary" style="background: #6366f1; font-size: 0.8rem;">🚐 MI UNIDAD</button>
            <button onclick="showPaymentForm()" class="btn btn-primary" style="background: #10b981; font-size: 0.8rem;">💰 REPORTAR PAGO</button>
            <button onclick="toggleJourneyForm()" class="btn btn-primary" id="btn-journey-toggle" style="background: #f59e0b; font-size: 0.8rem;">🚛 INICIAR JORNADA</button>
            <button onclick="showIssueForm()" class="btn btn-danger" id="btn-report-issue" style="font-size: 0.8rem; grid-column: span 2; margin-top: 10px;">⚠️ REPORTAR FALLA UNIDAD</button>
            <button onclick="showRepairForm()" class="btn btn-success hidden" id="btn-report-repair" style="font-size: 0.8rem; grid-column: span 2; margin-top: 10px;">✅ REPORTAR REPARACIÓN</button>
        </div>


        <!-- FORM: PAGO -->
        <div id="form-payment" class="hidden" style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 16px;">
            <label>Método de Pago</label>
            <select id="payment-method" style="width: 100%; padding: 12px; margin: 10px 0; border-radius: 8px; background: #000; color: #fff; border: 1px solid #333;">
                <option value="Efectivo (Bs)">Efectivo (Bs)</option>
                <option value="Pago Móvil">Pago Móvil</option>
            </select>
            <label>Monto Pago (Bs)</label>
            <input type="number" id="payment-amount" placeholder="0.00">
            <button onclick="reportPayment()" class="btn btn-success" style="margin-top: 10px;">Enviar Reporte de Pago</button>
            <button onclick="hideForms()" class="btn btn-danger" style="font-size: 0.75rem; margin-top: 8px;">❌ CANCELAR</button>
        </div>


        <!-- FORM: JORNADA -->
        <div id="form-journey" class="hidden" style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 16px;">
            <div id="actions-idle">
                <label>Unidad (Placa)</label>
                <input type="text" id="vehiculo-input" placeholder="Ej. PLACA-001">
                <label>Odómetro Inicial</label>
                <input type="number" id="start-odo" value="0">
                <button onclick="startJourney()" class="btn btn-success">🚀 Iniciar Jornada</button>
            </div>

            <div id="actions-active" class="hidden">
                <label>Odómetro Final</label>
                <input type="number" id="end-odo">
                <button onclick="endJourney()" class="btn btn-danger">🏁 Finalizar Jornada</button>
            </div>
            <button onclick="hideForms()" class="btn btn-danger" style="font-size: 0.75rem; margin-top: 15px;">❌ CANCELAR / CERRAR</button>
        </div>


        <!-- FORM: FALLA -->
        <div id="form-issue" class="hidden" style="margin-bottom: 20px; padding: 15px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 16px;">
            <label style="color: var(--danger);">Odómetro Actual (KM)</label>
            <input type="number" id="issue-odo" placeholder="Ej: 100500" style="margin-bottom: 10px;">
            <label style="color: var(--danger);">Descripción de la Falla</label>
            <textarea id="issue-desc" placeholder="Describe brevemente el problema..." style="width: 100%; padding: 12px; margin: 10px 0; border-radius: 8px; background: #000; color: #fff; border: 1px solid #333; height: 80px;"></textarea>
            <button onclick="reportIssue()" class="btn btn-danger">Enviar Reporte de Emergencia</button>
            <button onclick="hideForms()" class="btn btn-danger" style="background: rgba(255,255,255,0.05); margin-top: 10px; font-size: 0.75rem;">❌ CANCELAR</button>
        </div>

        <!-- FORM: REPARACIÓN -->
        <div id="form-repair" class="hidden" style="margin-bottom: 20px; padding: 15px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px;">
            <label style="color: var(--success);">Odómetro Actual (KM)</label>
            <input type="number" id="repair-odo" placeholder="Ej: 100505" style="margin-bottom: 10px;">
            <label style="color: var(--success);">Reporte de Solución</label>
            <textarea id="repair-desc" placeholder="¿Cómo se solucionó la falla?" style="width: 100%; padding: 12px; margin: 10px 0; border-radius: 8px; background: #000; color: #fff; border: 1px solid #333; height: 80px;"></textarea>
            <button onclick="reportRepair()" class="btn btn-success">✅ Confirmar Unidad Operativa</button>
            <button onclick="hideForms()" class="btn btn-danger" style="background: rgba(255,255,255,0.05); margin-top: 10px; font-size: 0.75rem;">❌ CANCELAR</button>
        </div>

    </div>

    <div class="log" id="sim-log">
        > Simulador listo.<br>
        > Esperando vinculación...
    </div>

</div>

<script>
    const API_BASE = window.location.origin + window.location.pathname.replace('driver_sim.php', 'api/');
    let driverData = JSON.parse(localStorage.getItem('sim_driver_data') || 'null');

    // UI Elements
    const logEl = document.getElementById('sim-log');
    const viewReg = document.getElementById('view-registration');
    const viewPanel = document.getElementById('view-panel');
    const idleActions = document.getElementById('actions-idle');
    const activeActions = document.getElementById('actions-active');

    function log(msg) {
        logEl.innerHTML += `<br>> ${msg}`;
        logEl.scrollTop = logEl.scrollHeight;
    }

    function updateUI() {
        if (!driverData) {
            document.getElementById('view-mode-selector').classList.remove('hidden');
            viewPanel.classList.add('hidden');
        } else {
            document.getElementById('view-mode-selector').classList.add('hidden');
            viewPanel.classList.remove('hidden');
            document.getElementById('driver-name').innerText = driverData.nombre;
            
            // 1. Estado de la Unidad (Bloqueo/Gracia)
            const stBadge = document.getElementById('driver-status');
            const btnIssue = document.getElementById('btn-report-issue');
            const btnRepair = document.getElementById('btn-report-repair');
            const graceBox = document.getElementById('grace-period-box');

            if (driverData.estado_unidad === 'mantenimiento') {
                stBadge.innerText = '🛠️ MANTENIMIENTO';
                stBadge.style.color = '#ef4444'; // Red-600 for attention
                btnIssue.classList.add('hidden');
                btnRepair.classList.remove('hidden');
                graceBox.classList.remove('hidden');
                startGraceTimer();
            } else {
                stBadge.innerText = driverData.is_active ? 'En Ruta' : 'Descansando';
                stBadge.style.color = driverData.is_active ? '#10b981' : 'rgba(255,255,255,0.4)';
                btnIssue.classList.remove('hidden');
                btnRepair.classList.add('hidden');
                graceBox.classList.add('hidden');
            }

            // 2. Botón de Jornada
            if (driverData.is_active) {
                idleActions.classList.add('hidden');
                activeActions.classList.remove('hidden');
                document.getElementById('btn-journey-toggle').innerText = '🏁 FINALIZAR RUTA';
                document.getElementById('btn-journey-toggle').style.background = 'var(--danger)';
            } else {
                idleActions.classList.remove('hidden');
                activeActions.classList.add('hidden');
                document.getElementById('btn-journey-toggle').innerText = '🚛 INICIAR JORNADA';
                document.getElementById('btn-journey-toggle').style.background = '#f59e0b';
            }

            if (driverData.vehiculo_placa) {
                document.getElementById('vehiculo-input').value = driverData.vehiculo_placa;
            }
        }
    }

    let graceTimerInterval = null;
    function startGraceTimer() {
        if (graceTimerInterval) return;
        let sec = 5400; // 90 min
        const timerEl = document.getElementById('grace-timer');
        const graceBox = document.getElementById('grace-period-box');
        const graceMsg = document.getElementById('grace-msg');
        const endBtn = document.getElementById('btn-journey-toggle');

        graceTimerInterval = setInterval(() => {
            sec--;
            let mins = Math.floor(sec / 60);
            let s = sec % 60;
            timerEl.innerText = `${mins}:${s < 10 ? '0' : ''}${s}`;
            
            if (sec <= 300) { // Last 5 mins warning
                timerEl.style.color = "var(--danger)";
            }

            if (sec <= 0) {
                clearInterval(graceTimerInterval);
                timerEl.innerText = "EXPIRÓ";
                graceBox.style.background = "rgba(239, 68, 68, 0.1)";
                graceBox.style.borderColor = "var(--danger)";
                graceMsg.innerHTML = "<strong>TIEMPO AGOTADO</strong><br>La unidad sigue fallando. Debes finalizar la jornada.";
                
                // Highlight end journey button
                endBtn.style.animation = "pulse 1s infinite";
                log("⚠️ Tiempo de gracia agotado. Se requiere finalizar jornada.");
            }
        }, 1000);
    }

    async function registerDriver() {
        let token = document.getElementById('token-input').value;
        const nombre = document.getElementById('name-input').value;
        const cedula = document.getElementById('cedula-input').value;
        const btn = document.getElementById('btn-reg');

        if (!token || !nombre || !cedula) return alert('Por favor, llena todos los datos.');

        // Smart Extraction: Si pegan el link entero, sacar solo el token
        if (token.includes('start=')) {
            token = token.split('start=')[1];
        }

        // Preview Logic
        try {
            const previewRes = await fetch(`${API_BASE}auth/invitaciones.php?token=${token}`);
            if (previewRes.ok) {
                const inv = await previewRes.json();
                document.getElementById('preview-coop').innerText = inv.cooperativa_nombre;
                if (inv.vehiculo_placa) {
                    document.getElementById('preview-unit').innerText = `${inv.vehiculo_modelo} (${inv.vehiculo_placa})`;
                    document.getElementById('preview-unit-box').classList.remove('hidden');
                } else {
                    document.getElementById('preview-unit-box').classList.add('hidden');
                }
                document.getElementById('registration-preview').classList.remove('hidden');
                log('✨ Invitación validada correctamente.');
            } else {
                document.getElementById('registration-preview').classList.add('hidden');
            }
        } catch (e) { console.error("Preview failed", e); }

        btn.innerText = 'PROCESANDO...';
        log(`Intento de registro con token: ${token.substring(0,6)}...`);

        try {
            // Generar ID numérico para compatibilidad con BIGINT
            const virtual_id = Math.floor(1000000000 + Math.random() * 9000000000); 
            const res = await fetch(`${API_BASE}auth/registrar.php`, {
                method: 'POST',
                body: JSON.stringify({
                    token: token,
                    telegram_id: virtual_id,
                    nombre: nombre,
                    cedula: cedula
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                log('✅ Registro exitoso en la cooperativa.');
                 driverData = { 
                    id: virtual_id, 
                    nombre: nombre, 
                    cedula: cedula, 
                    is_active: false,
                    coop_id: data.cooperativa_id,
                    vehiculo_id: data.vehiculo_id,
                    vehiculo_placa: data.vehiculo_placa
                };
                localStorage.setItem('sim_driver_data', JSON.stringify(driverData));
                updateUI();
            } else {
                const errorMsg = data.error || data.message || 'Token inválido o error desconocido';
                log(`❌ Error: ${errorMsg}`);
                alert(errorMsg);
            }
        } catch (e) {
            log(`❌ Error de conexión: ${e.message}`);
        } finally {
            btn.innerText = 'Vincular SIM a Cooperativa';
        }
    }

    function switchMode(mode) {
        if (mode === 'reg') {
            document.getElementById('mode-reg').classList.remove('hidden');
            document.getElementById('mode-login').classList.add('hidden');
            document.getElementById('tab-reg').style.background = 'var(--primary)';
            document.getElementById('tab-login').style.background = 'rgba(255,255,255,0.05)';
        } else {
            document.getElementById('mode-reg').classList.add('hidden');
            document.getElementById('mode-login').classList.remove('hidden');
            document.getElementById('tab-reg').style.background = 'rgba(255,255,255,0.05)';
            document.getElementById('tab-login').style.background = 'var(--primary)';
        }
    }

    async function loginExistingDriver() {
        const cedula = document.getElementById('login-cedula').value;
        const btn = document.getElementById('btn-login');
        if (!cedula) return alert('Ingresa una cédula.');
        
        btn.innerText = 'BUSCANDO...';
        log(`Buscando chofer con cédula: ${cedula}...`);

        try {
            const res = await fetch(`${API_BASE}auth/driver_login.php?cedula=${cedula}`);
            const data = await res.json();
            
            if (data.status === 'success') {
                const driver = data.driver;
                log('✅ Chofer encontrado. Cargando sesión...');
                
                driverData = { 
                    id: driver.telegram_id, 
                    nombre: driver.nombre, 
                    cedula: driver.cedula, 
                    is_active: (driver.active_route !== null),
                    coop_id: driver.cooperativa_id,
                    vehiculo_id: driver.vehiculo_id,
                    vehiculo_placa: driver.vehiculo_placa,
                    active_route_id: driver.active_route ? driver.active_route.id : null
                };
                localStorage.setItem('sim_driver_data', JSON.stringify(driverData));
                updateUI();
            } else {
                log(`❌ Error: ${data.error || 'Chofer no encontrado'}`);
                alert(data.error || 'Chofer no encontrado.');
            }
        } catch (e) {
            log('❌ Error al conectar con el servidor.');
        } finally {
            btn.innerText = 'Cargar Datos de Chofer';
        }
    }

    async function showStatus() {
        log('Solicitando Mi Estado...');
        try {
            const res = await fetch(`${API_BASE}chofer/mi_estado.php?telegram_id=${driverData.id}`);
            const data = await res.json();
            console.log("DEBUG Status Data:", data);
            
            // Garantizar valores si el objeto llegó vacío por error
            const placa = data.placa || 'N/A';
            const deuda = data.deuda !== undefined ? data.deuda : 0;
            const pendientes = data.pendientes !== undefined ? data.pendientes : 0;
            const km = data.ultimo_km || 0;
            const bancos = data.datos_bancarios || 'Consulte al admin';

            const msg = `📊 *ESTADO DE CUENTA*\n\n` +
                        `🔹 Unidad: ${placa}\n` +
                        `🔹 Deuda: Bs ${deuda}\n` +
                        `🔹 Pendiente: Bs ${pendientes}\n` +
                        `🔹 Último KM: ${km}\n\n` +
                        `💳 *Datos de Pago*:\n${bancos}`;
            showBotMsg(msg);

        } catch (e) { 
            log('❌ Error al obtener estado.'); 
            console.error(e);
        }
    }

    async function showUnit() {
        log('Solicitando info de unidad...');
        const msg = `🚛 *TU UNIDAD ASIGNADA*\n\n` +
                    `🔹 Placa: ${driverData.vehiculo_placa}\n` +
                    `🔹 Estado: Operativo\n\n` +
                    `Recuerda reportar cualquier falla mecánica al administrador.`;
        showBotMsg(msg);
    }

    function showBotMsg(text) {
        const el = document.getElementById('bot-response');
        el.innerText = text;
        el.classList.remove('hidden');
        log('📩 Mensaje recibido del Bot.');
    }

    function showPaymentForm() {
        hideForms();
        document.getElementById('form-payment').classList.remove('hidden');
    }

    function showIssueForm() {
        hideForms();
        document.getElementById('form-issue').classList.remove('hidden');
    }

    function showRepairForm() {
        hideForms();
        document.getElementById('form-repair').classList.remove('hidden');
    }

    function toggleJourneyForm() {
        hideForms();
        document.getElementById('form-journey').classList.remove('hidden');
        
        // AUTO-SKIP / SINGLE UNIT LOGIC (Sync with Bot v36.0)
        if (!driverData.is_active && driverData.vehiculo_placa) {
            log(`🚐 Unidad detectada: ${driverData.vehiculo_placa}. Saltando selección...`);
            document.getElementById('vehiculo-input').value = driverData.vehiculo_placa;
            document.getElementById('start-odo').focus();
        }
    }


    function hideForms() {
        document.getElementById('form-payment').classList.add('hidden');
        document.getElementById('form-journey').classList.add('hidden');
        document.getElementById('form-issue').classList.add('hidden');
        document.getElementById('form-repair').classList.add('hidden');
        document.getElementById('bot-response').classList.add('hidden');
    }

    async function checkCurrentStatus() {
        if (!driverData) return;
        try {
            const res = await fetch(`${API_BASE}chofer/mi_estado.php?telegram_id=${driverData.id}`);
            const data = await res.json();
            
            driverData.estado_unidad = data.estado_unidad; // Viene de mi_estado.php (agregado por middleware o query)
            driverData.is_active = data.ruta_activa;
            updateUI();
        } catch (e) { console.error("Sync failed", e); }
    }

    async function reportIssue() {
        const desc = document.getElementById('issue-desc').value;
        const odo = document.getElementById('issue-odo').value;
        if (!desc || !odo) return alert('Describe la falla e indica el odómetro.');
        
        log(`Reportando falla con auditoría: ${odo} KM...`);
        try {
            const res = await fetch(`${API_BASE}fleet/reportar_incidencia.php`, {
                method: 'POST',
                body: JSON.stringify({
                    telegram_id: driverData.id,
                    tipo: 'Mecánica', // Simplificado según usuario
                    descripcion: desc,
                    valor_odometro: odo,
                    foto_path: 'uploads/sim_falla.jpg'
                })
            });
            const data = await res.json();
            if (data.success) {
                log('📢 Reporte enviado. ODO registrado para auditoría.');
                driverData.estado_unidad = 'mantenimiento';
                showBotMsg(`⚠️ *FALLA REPORTADA*\n\n` +
                           `Su jornada SIGUE ACTIVA. Odómetro registrado: ${odo} km.\n\n` +
                           `Tiene 90 minutos para solventar o cerrar la ruta. Se auditará cualquier movimiento no reportado.`);
                hideForms();
                updateUI();
            } else { log(`❌ Error: ${data.error}`); }
        } catch (e) { log('❌ Error de comunicación.'); }
    }

    async function reportRepair() {
        const desc = document.getElementById('repair-desc').value;
        const odo = document.getElementById('repair-odo').value;
        if (!desc || !odo) return alert('Describe cómo se solucionó e indica el odómetro.');
        
        log(`Reportando reparación con auditoría: ${odo} KM...`);
        try {
            const res = await fetch(`${API_BASE}fleet/solucionar_incidencia.php`, {
                method: 'POST',
                body: JSON.stringify({
                    vehiculo_id: driverData.vehiculo_id,
                    valor_odometro: odo,
                    solucion: desc,
                    diagnostico: 'Reparación en ruta'
                })
            });
            const data = await res.json();
            if (data.success) {
                log('✅ UNIDAD DESBLOQUEADA. Puedes continuar tu ruta normalmente.');
                if (data.audit_alert) {
                    log('🚨 ALERTA: Se detectó discrepancia de KM. Notificación enviada al dueño.');
                }
                driverData.estado_unidad = 'activo';
                if (graceTimerInterval) {
                   clearInterval(graceTimerInterval);
                   graceTimerInterval = null;
                }
                showBotMsg(`🔧 *REPARACIÓN CONFIRMADA*\n\n` +
                           `Su unidad está nuevamente OPERATIVA.\n\n` +
                           `Gracias por reportar.`);
                hideForms();
                updateUI();
            } else { log(`❌ Error: ${data.error}`); }
        } catch (e) { log('❌ Error de comunicación.'); }
    }

    async function startJourney() {
        const odo = document.getElementById('start-odo').value;
        const v_id = document.getElementById('vehiculo-input').value;
        
        if (!v_id) return alert('Por favor, indica el ID o Placa del vehículo.');
        log(`Iniciando jornada para unidad ${v_id} con odómetro: ${odo}`);

        try {
            const res = await fetch(`${API_BASE}fleet/rutas.php`, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'start_route',
                    telegram_id: driverData.id,
                    vehiculo_id: v_id,
                    odometro_valor: odo,
                    foto_path: 'uploads/sim_start.jpg'
                })
            });
            const data = await res.json();
            if (data.ruta_id) {
                log('🚀 Jornada iniciada con éxito.');
                driverData.is_active = true;
                driverData.active_route_id = data.ruta_id;
                localStorage.setItem('sim_driver_data', JSON.stringify(driverData));
                updateUI();
            } else {
                log(`❌ Error: ${data.error || data.message}`);
            }
        } catch (e) { log('❌ Error de comunicación.'); }
    }

    async function reportPayment() {
        const amount = document.getElementById('payment-amount').value;
        const method = document.getElementById('payment-method').value;
        if (!amount) return alert('Ingresa un monto.');
        
        log(`Reportando pago de Bs ${amount} via ${method}...`);
        const ef = method === 'Efectivo (Bs)' ? amount : 0;
        const pm = method === 'Pago Móvil' ? amount : 0;

        try {
            const res = await fetch(`${API_BASE}chofer/reportar_pago.php`, {
                method: 'POST',
                body: JSON.stringify({
                    telegram_id: driverData.id,
                    monto_efectivo: ef,
                    monto_pagomovil: pm,
                    comprobante: 'uploads/sim_pago.jpg'
                })
            });
            const data = await res.json();
            if (data.success) {
                log('💰 Pago reportado correctamente.');
                document.getElementById('payment-amount').value = '';
                hideForms();
            } else { log(`❌ Error: ${data.error || data.message}`); }
        } catch (e) { log('❌ Error de comunicación.'); }
    }


    async function endJourney() {
        const odo = document.getElementById('end-odo').value;
        log(`Finalizando jornada con odómetro: ${odo}`);

        try {
            const res = await fetch(`${API_BASE}fleet/rutas.php`, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'end_route',
                    telegram_id: driverData.id,
                    ruta_id: driverData.active_route_id,
                    odometro_valor: odo,
                    foto_path: 'uploads/sim_end.jpg',
                    monto_efectivo: 0,
                    monto_pagomovil: 0
                })
            });
            const data = await res.json();
            if (data.message && !data.error) {
                log('🏁 Jornada finalizada.');
                driverData.is_active = false;
                delete driverData.active_route_id;
                localStorage.setItem('sim_driver_data', JSON.stringify(driverData));
                updateUI();
            } else { log(`❌ Error: ${data.error || data.message}`); }
        } catch (e) { log('❌ Error de comunicación.'); }
    }

    function logout() {
        if (confirm('¿Seguro que quieres borrar los datos de esta simulación?')) {
            localStorage.removeItem('sim_driver_data');
            window.location.reload();
        }
    }

    updateUI();
</script>

</body>
</html>
