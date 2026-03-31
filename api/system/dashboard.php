<?php
/**
 * Dashboard Statistics API (Refactored for Phase 35)
 */
require_once '../includes/middleware.php';

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

        // 3. Revenue Today (REFACTORED: Normalized to USD today)
        $stmt = $db->prepare("SELECT SUM(CASE 
                                WHEN moneda = 'Bs' THEN (monto_efectivo + monto_pagomovil) / NULLIF(tasa_cambio, 0) 
                                ELSE (monto_efectivo + monto_pagomovil) 
                              END) as total FROM pagos_reportados 
                              WHERE cooperativa_id = ? AND estado = 'aprobado' AND DATE(fecha_revision) = CURDATE()");
        $stmt->execute([$coop_id]);
        $recaudacion_hoy = $stmt->fetch()['total'] ?? 0;

        // 4. Alerts (Stale routes AND fuel discrepancies)
        $stmt = $db->prepare("SELECT 
                              (SELECT COUNT(*) FROM rutas 
                               WHERE cooperativa_id = ? AND estado = 'activa' AND DATE(started_at) < CURDATE())
                               +
                              (SELECT COUNT(*) FROM rutas 
                               WHERE cooperativa_id = ? AND alerta_combustible = 1 AND DATE(ended_at) = CURDATE())
                               as total");
        $stmt->execute([$coop_id, $coop_id]);
        $alertas_criticas = $stmt->fetch()['total'];

        // 5. Pending Payments
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM pagos_reportados 
                              WHERE cooperativa_id = ? AND estado = 'pendiente'");
        $stmt->execute([$coop_id]);
        $pagos_pendientes = $stmt->fetch()['total'];

        sendResponse([
            'stats' => [
                'total_vehiculos' => $total_vehiculos,
                'rutas_activas' => $rutas_activas,
                'recaudacion_hoy' => number_format((float)$recaudacion_hoy, 2, '.', ''),
                'alertas_criticas' => $alertas_criticas,
                'pagos_pendientes' => $pagos_pendientes
            ]
        ]);
    } catch (Exception $e) {
        sendResponse(['error' => 'Dashboard calculation failed', 'msg' => $e->getMessage()], 500);
    }
}
