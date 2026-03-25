<?php
/**
 * SuperAdmin Master Statistics API
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
if ($user['rol'] !== 'superadmin') {
    sendResponse(['error' => 'Forbidden'], 403);
}

$db = DB::getInstance();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // 1. Total Cooperatives
        $stmt = $db->query("SELECT COUNT(*) as total FROM cooperativas");
        $total_coops = $stmt->fetch()['total'];

        // 2. Global Fleet
        $stmt = $db->query("SELECT COUNT(*) as total FROM vehiculos");
        $total_vehiculos = $stmt->fetch()['total'];

        // 3. Global Active Routes
        $stmt = $db->query("SELECT COUNT(*) as total FROM rutas WHERE estado = 'activa' AND DATE(started_at) = CURDATE()");
        $total_rutas = $stmt->fetch()['total'];

        // 4. Global Revenue Today
        $stmt = $db->query("SELECT SUM(monto) as total FROM pagos_diarios WHERE fecha = CURDATE()");
        $recaudacion_total = $stmt->fetch()['total'] ?? 0;

        // 5. Billing Projection ($1.00 USD per vehicle / day)
        $billing_projection = $total_vehiculos * 1.00;

        // 6. Cooperatives List with metadata
        $stmt = $db->query("SELECT c.*, 
                            (SELECT COUNT(*) FROM vehiculos WHERE cooperativa_id = c.id) as vehiculos_count,
                            (SELECT COUNT(*) FROM rutas WHERE cooperativa_id = c.id AND estado = 'activa' AND DATE(started_at) = CURDATE()) as rutas_activas
                            FROM cooperativas c");
        $cooperativas = $stmt->fetchAll();

        sendResponse([
            'stats' => [
                'total_cooperativas' => $total_coops,
                'total_vehiculos' => $total_vehiculos,
                'total_rutas_activas' => $total_rutas,
                'recaudacion_total' => number_format((float)$recaudacion_total, 2, '.', ''),
                'proyeccion_saas' => number_format((float)$billing_projection, 2, '.', '')
            ],
            'cooperativas' => $cooperativas
        ]);
    } catch (Exception $e) {
        sendResponse(['error' => 'SuperAdmin calculation failed', 'msg' => $e->getMessage()], 500);
    }
}
?>
