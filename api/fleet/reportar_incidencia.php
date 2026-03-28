<?php
/**
 * API: Reportar Incidencia de Vehículo
 * Path: api/fleet/reportar_incidencia.php
 */
require_once __DIR__ . '/../includes/middleware.php';

$db = DB::getInstance();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $tid = $data['telegram_id'] ?? '';
    $tipo = $data['tipo'] ?? 'otro';
    $desc = $data['descripcion'] ?? '';
    $foto = $data['foto_path'] ?? '';

    // 1. Identificar Chofer por Telegram ID (Arquitectura Desacoplada)
    $stmt = $db->prepare("SELECT id, cooperativa_id FROM choferes WHERE telegram_id = ?");
    $stmt->execute([$tid]);
    $chofer = $stmt->fetch();

    if (!$chofer) {
        sendResponse(['error' => 'Chofer no vinculado o registrado'], 401);
    }

    // 2. Identificar Vehículo Asignado
    $stmt = $db->prepare("SELECT id, placa FROM vehiculos WHERE chofer_id = ? LIMIT 1");
    $stmt->execute([$chofer['id']]);
    $vehicle = $stmt->fetch();

    if (!$vehicle) {
        sendResponse(['error' => 'No tienes vehículo asignado permanentemente'], 400);
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

    // 4. BLOQUEO DE UNIDAD: La unidad queda inactiva hasta reparación
    $stmt = $db->prepare("UPDATE vehiculos SET estado = 'mantenimiento' WHERE id = ?");
    $stmt->execute([$vehicle['id']]);

    // 5. Gestión de Ruta Activa
    $stmt = $db->prepare("SELECT id, started_at, (SELECT cuota_diaria FROM vehiculos WHERE id = rutas.vehiculo_id) as cuota 
                          FROM rutas WHERE chofer_id = ? AND estado = 'activa' LIMIT 1");
    $stmt->execute([$chofer['id']]);
    $active_route = $stmt->fetch();

    $suggested_quota = 0;
    if ($active_route) {
        $start = strtotime($active_route['started_at']);
        $diff_hours = (time() - $start) / 3600;
        $suggested_quota = ($diff_hours < 4) ? $active_route['cuota'] * 0.5 : $active_route['cuota'];

        $stmtU = $db->prepare("UPDATE rutas SET estado = 'finalizada', observacion = ? WHERE id = ?");
        $stmtU->execute(["Interrumpida por falla: " . $desc, $active_route['id']]);
    }

    // 6. Notificar al dueño
    $stmtO = $db->prepare("SELECT u.telegram_chat_id FROM vehiculos v JOIN usuarios u ON v.dueno_id = u.id WHERE v.id = ?");
    $stmtO->execute([$vehicle['id']]);
    $owner_chat_id = $stmtO->fetchColumn();

    sendResponse([
        'success' => true, 
        'message' => 'Falla reportada. Unidad BLOQUEADA en taller.',
        'suggested_quota' => $suggested_quota,
        'ruta_id' => $active_route ? $active_route['id'] : null,
        'vehiculo_placa' => $vehicle['placa']
    ]);
}
?>



