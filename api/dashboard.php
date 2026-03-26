<?php
/**
 * Dashboard Statistics API
 */
require_once 'includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();
$coop_id = $user['cooperativa_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // 1. Total Fleet
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM vehiculos WHERE cooperativa_id = ?");
        $stmt->execute([$coop_id]);
        $total_vehiculos = $stmt->fetch()['total'];

        // 2. Active Routes (Today)
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM rutas 
                              WHERE cooperativa_id = ? 
                              AND estado = 'activa' 
                              AND DATE(started_at) = CURDATE()");
        $stmt->execute([$coop_id]);
        $rutas_activas = $stmt->fetch()['total'];

        // 3. Revenue Today
        $stmt = $db->prepare("SELECT SUM(monto) as total FROM pagos_diarios 
                              WHERE cooperativa_id = ? AND fecha = CURDATE()");
        $stmt->execute([$coop_id]);
        $recaudacion_hoy = $stmt->fetch()['total'] ?? 0;

        // 4. Alerts (Simplified: Odometers pending fin for yesterday's routes)
        // This is a placeholder for the real "Intelligence" logic in Phase 19
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM rutas r
                              LEFT JOIN odometros o ON r.id = o.ruta_id AND o.tipo = 'fin'
                              WHERE r.cooperativa_id = ? 
                              AND r.estado = 'activa' 
                              AND DATE(r.started_at) < CURDATE()");
        $stmt->execute([$coop_id]);
        $alertas_criticas = $stmt->fetch()['total'];

        sendResponse([
            'stats' => [
                'total_vehiculos' => $total_vehiculos,
                'rutas_activas' => $rutas_activas,
                'recaudacion_hoy' => number_format((float)$recaudacion_hoy, 2, '.', ''),
                'alertas_criticas' => $alertas_criticas
            ],
            'fleet_preview' => [] // More detailed fleet list pending Phase 18
        ]);
    } catch (Exception $e) {
        sendResponse(['error' => 'Dashboard calculation failed', 'msg' => $e->getMessage()], 500);
    }
}
?>
