<?php
/**
 * TuCooperativa - Routes & Odometer Management
 * Focus: Total Stability & Forensic Auditing
 */
require_once __DIR__ . '/../includes/middleware.php';
require_once __DIR__ . '/../includes/realtime.php';
require_once __DIR__ . '/../includes/telegram_helper.php';

$user = checkAuth();
$db = DB::getInstance();
$coop_id = $user['cooperativa_id'];

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    // Basic GET logic for Listing
    if ($method === 'GET') {
        try {
            if (isset($_GET['active_for_me'])) {
                $stmt = $db->prepare("SELECT r.*, v.placa FROM rutas r JOIN vehiculos v ON r.vehiculo_id = v.id WHERE r.chofer_id = ? AND r.estado = 'activa' LIMIT 1");
                $stmt->execute([$user['user_id']]);
                $res = $stmt->fetch();
                sendResponse($res ?: ['error' => 'No active route found']);
            }
            $stmt = $db->prepare("SELECT r.*, v.placa, c.nombre as chofer_nombre FROM rutas r JOIN vehiculos v ON r.vehiculo_id = v.id JOIN choferes c ON r.chofer_id = c.id WHERE r.cooperativa_id = ? AND r.estado = 'activa'");
            $stmt->execute([$coop_id]);
            sendResponse($stmt->fetchAll());
        } catch (Exception $e) {
            sendResponse(['error' => $e->getMessage()], 500);
        }
    }
    sendResponse(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

try {
    if ($action === 'start_route') {
        $vehiculo_identifer = $data['vehiculo_id'] ?? null; // ID or Placa
        $odo_val = $data['odometro_valor'] ?? null;
        $foto = $data['foto_path'] ?? '';

        if (!$vehiculo_identifer || $odo_val === null) {
            throw new Exception("Vehículo y odómetro son requeridos.");
        }

        $db->beginTransaction();

        // 1. Resolve Vehicle ID
        $v_id = null;
        if (is_numeric($vehiculo_identifer)) {
            $v_id = intval($vehiculo_identifer);
        } else {
            $stmtV = $db->prepare("SELECT id FROM vehiculos WHERE placa = ? AND cooperativa_id = ?");
            $stmtV->execute([$vehiculo_identifer, $coop_id]);
            $v_id = $stmtV->fetchColumn();
        }

        if (!$v_id) {
            throw new Exception("Unidad no encontrada o placa inválida ($vehiculo_identifer).");
        }

        // 2. Check for existing active route
        $stmtCheck = $db->prepare("SELECT id FROM rutas WHERE vehiculo_id = ? AND estado = 'activa'");
        $stmtCheck->execute([$v_id]);
        if ($stmtCheck->fetch()) {
            throw new Exception("Esta unidad ya tiene una jornada activa.");
        }

        // 3. Create Route
        $sqlRuta = "INSERT INTO rutas (cooperativa_id, vehiculo_id, chofer_id, estado, started_at) VALUES (?, ?, ?, 'activa', CURRENT_TIMESTAMP)";
        $stmtR = $db->prepare($sqlRuta);
        $stmtR->execute([$coop_id, $v_id, $user['user_id']]);
        $ruta_id = $db->lastInsertId();

        // 4. Log Odometer
        $sqlOdo = "INSERT INTO odometros (cooperativa_id, ruta_id, valor, tipo, foto_path) VALUES (?, ?, ?, 'inicio', ?)";
        $stmtO = $db->prepare($sqlOdo);
        $stmtO->execute([$coop_id, $ruta_id, $odo_val, $foto]);

        $db->commit();

        // --- NOTIFICACIONES ---
        try {
            $stmtOwner = $db->prepare("SELECT v.placa, u.telegram_chat_id FROM vehiculos v JOIN usuarios u ON v.dueno_id = u.id WHERE v.id = ?");
            $stmtOwner->execute([$v_id]);
            $owner = $stmtOwner->fetch();

            if ($owner && $owner['telegram_chat_id']) {
                $msg = "🚛 *INICIO DE JORNADA*\n\n" .
                       "📍 Unidad: `{$owner['placa']}`\n" .
                       "👤 Chofer: `{$user['nombre']}`\n" .
                       "🛣️ Odómetro: `{$odo_val}` km";
                sendTelegramNotification($owner['telegram_chat_id'], $msg);
            }
            broadcastRealtime('REFRESH_FLEET', ['cooperativa_id' => $coop_id]);
        } catch (Exception $e) {
            error_log("TuCooperativa Non-fatal: Notif failed. " . $e->getMessage());
        }

        sendResponse(['message' => 'Ruta iniciada', 'ruta_id' => $ruta_id]);

    } elseif ($action === 'end_route') {
        $ruta_id = $data['ruta_id'] ?? null;
        $odo_val = $data['odometro_valor'] ?? null;
        $foto = $data['foto_path'] ?? '';

        if (!$ruta_id || $odo_val === null) {
            throw new Exception("Parámetros incompletos para finalizar jornada.");
        }

        $db->beginTransaction();

        // 1. Fetch Route Metadata + Owner Info
        $stmtMeta = $db->prepare("
            SELECT r.*, v.placa, v.km_por_litro, v.cuota_diaria, u.telegram_chat_id as owner_tid 
            FROM rutas r 
            JOIN vehiculos v ON r.vehiculo_id = v.id 
            JOIN usuarios u ON v.dueno_id = u.id
            WHERE r.id = ? AND r.cooperativa_id = ?
        ");
        $stmtMeta->execute([$ruta_id, $coop_id]);
        $ruta_info = $stmtMeta->fetch();

        if (!$ruta_info) {
            throw new Exception("La ruta no existe o no pertenece a tu cooperativa.");
        }

        if ($ruta_info['estado'] === 'finalizada') {
            throw new Exception("Esta jornada ya fue finalizada anteriormente.");
        }

        // 2. Fetch Start Odometer
        $stmtOdoIn = $db->prepare("SELECT valor FROM odometros WHERE ruta_id = ? AND tipo = 'inicio'");
        $stmtOdoIn->execute([$ruta_id]);
        $start_odo = floatval($stmtOdoIn->fetchColumn() ?: 0);

        if (floatval($odo_val) < $start_odo) {
            throw new Exception("Odómetro actual ($odo_val) no puede ser menor al inicial ($start_odo).");
        }

        // 3. Update Route State & Financials
        $efectivo = floatval($data['monto_efectivo'] ?? 0);
        $pagomovil = floatval($data['monto_pagomovil'] ?? 0);
        $total_pago = $efectivo + $pagomovil;

        $sqlFin = "UPDATE rutas SET estado = 'finalizada', ended_at = CURRENT_TIMESTAMP, monto_efectivo = ?, monto_pagomovil = ? WHERE id = ?";
        $stmtF = $db->prepare($sqlFin);
        $stmtF->execute([$efectivo, $pagomovil, $ruta_id]);

        // 4. Log End Odometer
        $sqlOdoFin = "INSERT INTO odometros (cooperativa_id, ruta_id, valor, tipo, foto_path) VALUES (?, ?, ?, 'fin', ?)";
        $stmtO = $db->prepare($sqlOdoFin);
        $stmtO->execute([$coop_id, $ruta_id, $odo_val, $foto]);

        // 5. Create Payment Record (for Forensic Audit)
        $sqlPago = "INSERT INTO pagos_reportados (cooperativa_id, vehiculo_id, chofer_id, id_ruta, monto, monto_efectivo, monto_pagomovil, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 'aprobado')";
        $stmtP = $db->prepare($sqlPago);
        $stmtP->execute([$coop_id, $ruta_info['vehiculo_id'], $user['user_id'], $ruta_id, $total_pago, $efectivo, $pagomovil]);

        // 6. Optional: Maintenance Audit (Surgical safety)
        try {
            // Maintenance check
            $stmtM = $db->prepare("SELECT * FROM mantenimiento_items WHERE vehiculo_id = ?");
            $stmtM->execute([$ruta_info['vehiculo_id']]);
            foreach ($stmtM->fetchAll() as $item) {
                if ($odo_val >= (floatval($item['ultimo_odometro']) + floatval($item['frecuencia']))) {
                    error_log("TuCooperativa INFO: Mantenimiento vencido para " . $item['nombre']);
                }
            }
        } catch (Exception $fuelEx) {
            error_log("TuCooperativa NON-FATAL ERROR (Maint): " . $fuelEx->getMessage());
        }

        $db->commit();

        // --- NOTIFICACIONES ---
        try {
            $distancia = floatval($odo_val) - $start_odo;
            if ($ruta_info['owner_tid']) {
                $msg = "🏁 *JORNADA FINALIZADA*\n\n" .
                       "📍 Unidad: `{$ruta_info['placa']}`\n" .
                       "👤 Chofer: `{$user['nombre']}`\n" .
                       "📟 Odómetro Final: `{$odo_val}` km\n" .
                       "🛣️ Recorrido: `{$distancia}` km\n" .
                       "💰 Abono: `Bs " . ($efectivo + $pagomovil) . "`";
                sendTelegramNotification($ruta_info['owner_tid'], $msg);
            }
            broadcastRealtime('REFRESH_FLEET', ['cooperativa_id' => $coop_id]);
            broadcastRealtime('REFRESH_PAYMENTS', ['cooperativa_id' => $coop_id]);
        } catch (Exception $e) {
            error_log("TuCooperativa Non-fatal: Notif failed. " . $e->getMessage());
        }

        sendResponse(['message' => 'Jornada finalizada exitosamente', 'distancia' => ($odo_val - $start_odo)]);

    } else {
        throw new Exception("Acción inválida: $action");
    }
} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log("TuCooperativa STABILITY ERROR: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
    sendResponse(['error' => $e->getMessage()], 500);
}
