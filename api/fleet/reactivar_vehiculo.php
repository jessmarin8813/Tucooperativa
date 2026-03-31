<?php
/**
 * API: Reactivar Vehículo (Reparación Completada)
 * Path: api/fleet/reactivar_vehiculo.php
 */
require_once __DIR__ . '/../includes/middleware.php';

$db = DB::getInstance();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $tid = $data['telegram_id'] ?? '';
    $foto = $data['foto_path'] ?? '';

    // 1. Identificar Usuario
    $stmt = $db->prepare("SELECT id, cooperativa_id FROM usuarios WHERE telegram_id = ?");
    $stmt->execute([$tid]);
    $user = $stmt->fetch();

    if (!$user) {
        sendResponse(['error' => 'Usuario no vinculado'], 401);
    }

    // 2. Identificar su vehículo en Mantenimiento
    $stmt = $db->prepare("SELECT id FROM vehiculos WHERE chofer_id = ? AND estado = 'mantenimiento' LIMIT 1");
    $stmt->execute([$user['id']]);
    $vehicle = $stmt->fetch();

    if (!$vehicle) {
        sendResponse(['error' => 'No tienes vehículos bloqueados por reparación.'], 400);
    }

    // 3. Reactivar: Pasar a Activo
    $stmt = $db->prepare("UPDATE vehiculos SET estado = 'activo', status_changed_at = NOW() WHERE id = ?");
    $stmt->execute([$vehicle['id']]);

    // 4. Registrar en historial de incidencias (opcional, aquí solo logueamos la reparación)
    $stmt = $db->prepare("INSERT INTO incidencias (cooperativa_id, vehiculo_id, chofer_id, tipo, descripcion, foto_path) 
                          VALUES (?, ?, ?, 'otro', 'REPARACIÓN COMPLETADA', ?)");
    $stmt->execute([$user['cooperativa_id'], $vehicle['id'], $user['id'], $foto]);

    sendResponse(['success' => true, 'message' => '¡Unidad reactivada! Ya puedes iniciar jornada.']);
}
