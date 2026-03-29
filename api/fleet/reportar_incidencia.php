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

    // 2. Identificar Vehículo Asignado
    $stmt = $db->prepare("SELECT v.id, v.placa, v.dueno_id, u.telegram_chat_id as owner_tid 
                          FROM vehiculos v 
                          JOIN usuarios u ON v.dueno_id = u.id
                          WHERE v.chofer_id = ? LIMIT 1");
    $stmt->execute([$chofer['id']]);
    $vehicle = $stmt->fetch();

    if (!$vehicle) {
        sendResponse(['error' => 'No tienes vehículo asignado'], 400);
    }

    // 3. Registrar Incidencia
    $stmt = $db->prepare("INSERT INTO incidencias (cooperativa_id, vehiculo_id, chofer_id, tipo, descripcion, foto_path) 
                          VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $chofer['cooperativa_id'],
        $vehicle['id'],
        $chofer['id'],
        $tipo,
        $desc,
        $foto
    ]);

    // 4. BLOQUEO DE UNIDAD: Estado Inactivo por Mantenimiento
    $stmt = $db->prepare("UPDATE vehiculos SET estado = 'mantenimiento' WHERE id = ?");
    $stmt->execute([$vehicle['id']]);

    // 5. NOTIFICAR AL DUEÑO (Telegram)
    // Se notifica la falla pero se indica que la jornada SIGUE ACTIVA (Grace Period)
    if ($vehicle['owner_tid']) {
        $msg = "📢 *REPORTE DE INCIDENCIA*\n\n" .
               "📍 Unidad: `{$vehicle['placa']}`\n" .
               "👤 Chofer: `{$chofer['nombre']}`\n" .
               "⚠️ Falla: *{$tipo}*\n" .
               "📝 Detalle: `{$desc}`\n" .
               "⏳ *PERIODO DE GRACIA (60 MIN)*\n" .
               "La jornada sigue activa. El chofer debe reportar la reparación o cerrar la ruta manualmente.";
        sendTelegramNotification($vehicle['owner_tid'], $msg);
    }

    // 6. BROADCAST REALTIME (Hub)
    broadcastRealtime('REFRESH_FLEET', ['cooperativa_id' => $chofer['cooperativa_id']]);
    broadcastRealtime('UPDATE_VEHICLE_STATUS', [
        'vehiculo_id' => $vehicle['id'],
        'placa' => $vehicle['placa'],
        'estado' => 'mantenimiento'
    ]);

    sendResponse([
        'success' => true, 
        'message' => 'Falla reportada. Periodo de gracia iniciado.',
        'vehiculo_placa' => $vehicle['placa'],
        'grace_period_minutes' => 60
    ]);
}
?>



