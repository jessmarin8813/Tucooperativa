<?php
/**
 * API: Reportar Incidencia de Vehículo
 * Path: api/fleet/reportar_incidencia.php
 */
require_once __DIR__ . '/../includes/middleware.php';
require_once __DIR__ . '/../includes/realtime.php';
require_once __DIR__ . '/../includes/telegram_helper.php';

$db = DB::getInstance();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $tid = $data['telegram_id'] ?? '';
    $tipo = $data['tipo'] ?? 'otro';
    $desc = $data['descripcion'] ?? '';
    // Corregimos la foto path por si viene vacía
    $foto = $data['foto_path'] ?? 'uploads/no-photo.jpg';

    // 1. Identificar Chofer por Telegram ID
    $stmt = $db->prepare("SELECT id, nombre, cooperativa_id FROM choferes WHERE telegram_id = ?");
    $stmt->execute([$tid]);
    $chofer = $stmt->fetch();

    if (!$chofer) {
        sendResponse(['error' => 'Chofer no vinculado'], 401);
    }

    // 2. BUSCAR RUTA ACTIVA
    $stmtRuta = $db->prepare("SELECT id, vehiculo_id FROM rutas WHERE chofer_id = ? AND estado = 'activa' LIMIT 1");
    $stmtRuta->execute([$chofer['id']]);
    $ruta = $stmtRuta->fetch();

    $ruta_id = $ruta ? $ruta['id'] : null;
    $v_id = $ruta ? $ruta['vehiculo_id'] : null;
    $odo_val = $data['valor_odometro'] ?? null;

    if ($odo_val === null) {
        throw new Exception("El kilometraje (odómetro) es obligatorio para reportar una falla.");
    }

    // 3. IDENTIFICAR Y CARGAR VEHÍCULO (PARA NOTIFICACIÓN Y AUDITORÍA)
    if (!$v_id) {
       $stmtV = $db->prepare("SELECT id FROM vehiculos WHERE chofer_id = ? LIMIT 1");
       $stmtV->execute([$chofer['id']]);
       $v_id = $stmtV->fetchColumn();
    }

    if (!$v_id) throw new Exception("No se encontró vehículo asignado para este reporte.");

    // Cargar datos extendidos del vehículo para la notificación al dueño
    $stmtVData = $db->prepare("SELECT v.*, u.telegram_chat_id as owner_tid 
                              FROM vehiculos v 
                              LEFT JOIN usuarios u ON v.dueno_id = u.id 
                              WHERE v.id = ?");
    $stmtVData->execute([$v_id]);
    $vehicle = $stmtVData->fetch();

    if (!$vehicle) throw new Exception("Error al cargar datos del vehículo.");

    $db->beginTransaction();

    // 4. ACTUALIZAR ESTADO DEL VEHÍCULO
    if ($vehicle['estado'] !== 'mantenimiento') {
        $stmtUpd = $db->prepare("UPDATE vehiculos SET estado = 'mantenimiento', status_changed_at = NOW() WHERE id = ?");
        $stmtUpd->execute([$v_id]);
    }

    // 5. LOG ODOMETRO DE INCIDENCIA (Auditoría Forense)
    $sqlOdo = "INSERT INTO odometros (cooperativa_id, ruta_id, valor, tipo, foto_path) VALUES (?, ?, ?, 'incidencia', ?)";
    $stmtO = $db->prepare($sqlOdo);
    $stmtO->execute([$chofer['cooperativa_id'], $ruta_id, $odo_val, $foto]);

    // 6. Registrar Incidencia
    $stmt = $db->prepare("INSERT INTO incidencias (cooperativa_id, vehiculo_id, chofer_id, tipo, descripcion, foto_path) 
                          VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $chofer['cooperativa_id'],
        $v_id,
        $chofer['id'],
        $tipo,
        $desc,
        $foto
    ]);

    $db->commit();

    // 7. NOTIFICAR AL DUEÑO (Telegram)
    if (!empty($vehicle['owner_tid'])) {
        $msg = "📢 *REPORTE DE INCIDENCIA*\n\n" .
               "📍 Unidad: `{$vehicle['placa']}`\n" .
               "👤 Chofer: `{$chofer['nombre']}`\n" .
               "⚠️ Falla: *{$tipo}*\n" .
               "📝 Detalle: `{$desc}`\n" .
               "⏳ *PERIODO DE GRACIA (90 MIN)*\n" .
               "La jornada sigue activa. El chofer debe reportar la reparación o cerrar la ruta manualmente.";
        sendTelegramNotification($vehicle['owner_tid'], $msg);
    }

    // 8. BROADCAST REALTIME (Hub)
    broadcastRealtime('REFRESH_FLEET', ['cooperativa_id' => $chofer['cooperativa_id']]);
    broadcastRealtime('UPDATE_VEHICLE_STATUS', [
        'vehiculo_id' => $v_id,
        'placa' => $vehicle['placa'],
        'estado' => 'mantenimiento'
    ]);

    sendResponse([
        'success' => true, 
        'message' => 'Falla reportada. Periodo de gracia iniciado.',
        'vehiculo_placa' => $vehicle['placa'],
        'grace_period_minutes' => 90
    ]);
}
?>



