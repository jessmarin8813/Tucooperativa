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
    </style>
</head>
<body>

<div class="container">
    <div class="glass">
        <h1 class="neon-text">Driver SIM</h1>
        <p>Emulador de Chofer Virtual v1.0</p>
    </div>

    <!-- PESTAÑA: REGISTRO -->
    <div id="view-registration" class="glass">
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

    <!-- PESTAÑA: PANEL DE CONTROL -->
    <div id="view-panel" class="glass hidden">
        <div class="card-driver">
            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.05); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem;">🚛</div>
            <div>
                <h2 id="driver-name" style="margin: 0; font-size: 1.4rem;">Nombre Chofer</h2>
                <div id="driver-status" class="status-badge" style="background: rgba(255,255,255,0.1); display: inline-block; margin-top: 5px;">Offline</div>
            </div>
        </div>

        <div id="actions-idle">
            <label>Odómetro Inicial</label>
            <input type="number" id="start-odo" value="0">
            <button onclick="startJourney()" class="btn btn-success">Iniciar Jornada</button>
        </div>

        <div id="actions-active" class="hidden">
            <div style="margin-bottom: 15px;">
                <label>Monto Pago ($)</label>
                <input type="number" id="payment-amount" placeholder="0.00">
                <button onclick="reportPayment()" class="btn btn-primary" style="background: var(--accent);">Reportar Pago Diario</button>
            </div>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
            <label>Odómetro Final</label>
            <input type="number" id="end-odo">
            <button onclick="endJourney()" class="btn btn-danger">Finalizar Jornada</button>
        </div>
    </div>

    <div class="log" id="sim-log">
        > Simulador listo.<br>
        > Esperando vinculación...
    </div>

    <button onclick="logout()" class="btn" style="background: transparent; color: var(--text-dim); text-decoration: underline; font-size: 0.7rem;">Borrar Simulación y Empezar de Cero</button>
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
            viewReg.classList.remove('hidden');
            viewPanel.classList.add('hidden');
        } else {
            viewReg.classList.add('hidden');
            viewPanel.classList.remove('hidden');
            document.getElementById('driver-name').innerText = driverData.nombre;
            
            if (driverData.is_active) {
                idleActions.classList.add('hidden');
                activeActions.classList.remove('hidden');
                document.getElementById('driver-status').innerText = 'En Ruta';
                document.getElementById('driver-status').style.color = '#10b981';
            } else {
                idleActions.classList.remove('hidden');
                activeActions.classList.add('hidden');
                document.getElementById('driver-status').innerText = 'Descansando';
                document.getElementById('driver-status').style.color = 'rgba(255,255,255,0.4)';
            }
        }
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
                    coop_id: data.cooperativa_id 
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

    async function startJourney() {
        const odo = document.getElementById('start-odo').value;
        const v_id = context.user_data['vehiculo_id'];
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
        if (!amount) return;
        log(`Reportando pago de Bs ${amount}...`);

        try {
            const res = await fetch(`${API_BASE}chofer/reportar_pago.php`, {
                method: 'POST',
                body: JSON.stringify({
                    telegram_id: driverData.id,
                    monto_efectivo: amount,
                    monto_pagomovil: 0,
                    comprobante: 'uploads/sim_pago.jpg'
                })
            });
            const data = await res.json();
            if (data.success) {
                log('💰 Pago reportado correctamente.');
                document.getElementById('payment-amount').value = '';
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
                    combustible_reportado: 10,
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
