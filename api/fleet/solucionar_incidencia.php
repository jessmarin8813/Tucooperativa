<?php
/**
 * API: Solucionar Incidencia (Desbloqueo de Unidad)
 * Path: api/fleet/solucionar_incidencia.php
 */
require_once __DIR__ . '/../includes/middleware.php';
require_once __DIR__ . '/../includes/realtime.php';
require_once __DIR__ . '/../includes/telegram_helper.php';

$db = DB::getInstance();
$user = checkAuth(); // Mantenemos compatibilidad con Sesión y Telegram ID

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $v_id = $data['vehiculo_id'] ?? null;
    $diagnostico = $data['diagnostico'] ?? 'N/A';
    $solucion = $data['solucion'] ?? 'Reparación reportada';

    if (!$v_id) {
        sendResponse(['error' => 'ID de vehículo es requerido'], 400);
    }

    // 1. Verificar Permisos (Chofer asignado o Dueño de la unidad)
    $stmt = $db->prepare("SELECT v.*, u.telegram_chat_id as owner_tid 
                          FROM vehiculos v 
                          JOIN usuarios u ON v.dueno_id = u.id 
                          WHERE v.id = ?");
    $stmt->execute([$v_id]);
    $vehicle = $stmt->fetch();

    if (!$vehicle) {
        sendResponse(['error' => 'Vehículo no encontrado'], 404);
    }

    $is_allowed = false;
    // Caso: Es el Dueño/Admin autenticado por sesión
    if (isset($user['user_id']) && ($user['rol'] === 'admin' || $user['rol'] === 'dueno' || $user['user_id'] == $vehicle['dueno_id'])) {
        $is_allowed = true;
    }
    // Caso: Es el Chofer autenticado por telegram_id
    if (isset($user['rol']) && $user['rol'] === 'chofer' && $user['user_id'] == $vehicle['chofer_id']) {
        $is_allowed = true;
    }

    if (!$is_allowed) {
        sendResponse(['error' => 'No tienes permiso para desbloquear esta unidad'], 403);
    }

    // 2. Actualizar Incidencia más reciente (opcional, para cerrar el ciclo)
    $stmtInc = $db->prepare("UPDATE incidencias SET diagnostico = ?, solucion = ? 
                            WHERE vehiculo_id = ? AND solucion IS NULL 
                            ORDER BY created_at DESC LIMIT 1");
    $stmtInc->execute([$diagnostico, $solucion, $v_id]);

    // 3. DESBLOQUEAR UNIDAD: Estado Activo
    $stmtU = $db->prepare("UPDATE vehiculos SET estado = 'activo' WHERE id = ?");
    $stmtU->execute([$v_id]);

    // 4. NOTIFICACIONES
    $msg = "🔧 *REPARACIÓN COMPLETADA*\n\n" .
           "📍 Unidad: `{$vehicle['placa']}`\n" .
           "✅ Estado: *OPERATIVO*\n" .
           "📝 Solución: `{$solucion}`";

    // Notificar al dueño si el chofer reparó
    if ($user['rol'] === 'chofer' && $vehicle['owner_tid']) {
        sendTelegramNotification($vehicle['owner_tid'], $msg);
    }
    
    // Notificar por Realtime
    broadcastRealtime('REFRESH_FLEET', ['cooperativa_id' => $vehicle['cooperativa_id']]);
    broadcastRealtime('UPDATE_VEHICLE_STATUS', [
        'vehiculo_id' => $v_id,
        'placa' => $vehicle['placa'],
        'estado' => 'activo'
    ]);

    sendResponse([
        'success' => true, 
        'message' => 'Unidad desbloqueada exitosamente.',
        'vehiculo_placa' => $vehicle['placa']
    ]);
}
?>
