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
    $odo_val = $data['valor_odometro'] ?? null;
    $diagnostico = $data['diagnostico'] ?? 'N/A';
    $solucion = $data['solucion'] ?? 'Reparación reportada';

    if (!$v_id || $odo_val === null) {
        sendResponse(['error' => 'ID de vehículo y kilometraje son requeridos'], 400);
    }

    // 1. Verificar Permisos y Datos de Auditoría
    $stmt = $db->prepare("SELECT v.*, u.telegram_chat_id as owner_tid, 
                          (SELECT valor FROM odometros WHERE ruta_id = (SELECT id FROM rutas WHERE vehiculo_id = v.id AND estado = 'activa' LIMIT 1) AND tipo = 'incidencia' ORDER BY created_at DESC LIMIT 1) as odo_incidencia
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

    $db->beginTransaction();

    // 2. Auditoría Forense: ¿Se movió la unidad mientras estaba en "falla"?
    $alerta_auditoria = false;
    $diff_km = 0;
    if ($vehicle['odo_incidencia'] !== null) {
        $diff_km = floatval($odo_val) - floatval($vehicle['odo_incidencia']);
        if ($diff_km > 20) { // Tolerancia de 20km (Ej: Tipuro -> Av. Orinoco + Prueba de manejo)
            $alerta_auditoria = true;
        }
    }

    // 3. Actualizar Incidencias
    $stmtInc = $db->prepare("UPDATE incidencias SET diagnostico = ?, solucion = ?, resolved_at = NOW() 
                            WHERE vehiculo_id = ? AND resolved_at IS NULL 
                            ORDER BY created_at DESC LIMIT 1");
    $stmtInc->execute([$diagnostico, $solucion, $v_id]);

    // 4. DESBLOQUEAR UNIDAD: Estado Activo
    $stmtU = $db->prepare("UPDATE vehiculos SET estado = 'activo' WHERE id = ?");
    $stmtU->execute([$v_id]);

    // 5. Registrar nuevo odómetro de reparación
    $stmtO = $db->prepare("INSERT INTO odometros (cooperativa_id, ruta_id, valor, tipo) VALUES (?, (SELECT id FROM rutas WHERE vehiculo_id = ? AND estado = 'activa' LIMIT 1), ?, 'reparacion')");
    $stmtO->execute([$vehicle['cooperativa_id'], $v_id, $odo_val]);

    $db->commit();

    // 6. NOTIFICACIONES
    $stLabel = ($vehicle['estado'] ?? 'activo') === 'mantenimiento' ? 'MANTENIMIENTO' : 'OPERATIVO';
    $msg = "🔧 *REPARACIÓN COMPLETADA*\n\n" .
           "📍 Unidad: `{$vehicle['placa']}`\n" .
           "✅ Estado: *{$stLabel}*\n" .
           "📟 KM Reportado: `{$odo_val}`\n" .
           "📝 Solución: `{$solucion}`";

    // Alerta de Auditoría (PIRATEO DETECTADO)
    if ($alerta_auditoria && $vehicle['owner_tid']) {
        $audit_msg = "🚨 *AUDITORÍA: ACTIVIDAD NO REPORTADA*\n\n" .
                     "📍 Unidad: `{$vehicle['placa']}`\n" .
                     "⚠️ Detalle: Se detectó un desplazamiento de *{$diff_km} km* mientras la unidad estaba en mantenimiento.\n\n" .
                     "📟 KM en Falla: `{$vehicle['odo_incidencia']}`\n" .
                     "📟 KM en Reparación: `{$odo_val}`\n" .
                     "🔍 Verifique el uso de la unidad.";
        sendTelegramNotification($vehicle['owner_tid'], $audit_msg);
    }

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
        'message' => 'Unidad desbloqueada.',
        'audit_alert' => $alerta_auditoria
    ]);
}
?>
