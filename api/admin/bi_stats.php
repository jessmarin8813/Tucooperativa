<?php
/**
 * BI Stats API (Advanced Analytics)
 * Path: api/admin/bi_stats.php
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
if ($user['rol'] !== 'owner' && $user['rol'] !== 'superadmin') {
    sendResponse(['error' => 'Forbidden'], 403);
}

$db = DB::getInstance();
$coop_id = $user['cooperativa_id'];

try {
    $stmtTrend = $db->prepare("SELECT DATE(fecha_reportado) as fecha, SUM(CASE WHEN moneda = 'Bs' THEN (monto_efectivo + monto_pagomovil) / NULLIF(tasa_cambio, 0) ELSE (monto_efectivo + monto_pagomovil) END) as total 
                               FROM pagos_reportados 
                               WHERE cooperativa_id = ? AND estado = 'aprobado' AND fecha_reportado >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                               GROUP BY DATE(fecha_reportado) ORDER BY fecha ASC");
    $stmtTrend->execute([$coop_id]);
    $revenueTrend = $stmtTrend->fetchAll();

    $stmtExpTrend = $db->prepare("SELECT fecha, SUM(CASE WHEN moneda = 'Bs' THEN monto / NULLIF(tasa_cambio, 0) ELSE monto END) as total 
                                   FROM gastos 
                                   WHERE cooperativa_id = ? AND fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                                   GROUP BY fecha ORDER BY fecha ASC");
    $stmtExpTrend->execute([$coop_id]);
    $expensesTrend = $stmtExpTrend->fetchAll();

    $stmtDrivers = $db->prepare("SELECT u.nombre, SUM(CASE WHEN p.moneda = 'Bs' THEN (p.monto_efectivo + p.monto_pagomovil) / NULLIF(p.tasa_cambio, 0) ELSE (p.monto_efectivo + p.monto_pagomovil) END) as total
                                 FROM pagos_reportados p
                                 JOIN choferes u ON p.chofer_id = u.id
                                 WHERE p.cooperativa_id = ? AND p.estado = 'aprobado'
                                 GROUP BY p.chofer_id
                                 ORDER BY total DESC LIMIT 5");
    $stmtDrivers->execute([$coop_id]);
    $topDrivers = $stmtDrivers->fetchAll();

    // 4. Fuel Consumption stats
    $stmtFuel = $db->prepare("SELECT v.placa, SUM(r.combustible_reportado) as total_litros
                              FROM rutas r
                              JOIN vehiculos v ON r.vehiculo_id = v.id
                              WHERE v.cooperativa_id = ?
                              GROUP BY v.id ORDER BY total_litros DESC LIMIT 5");
    $stmtFuel->execute([$coop_id]);
    $fuelStats = $stmtFuel->fetchAll();

    $stmtTotals = $db->prepare("SELECT 
                                (SELECT SUM(CASE WHEN moneda = 'Bs' THEN (monto_efectivo + monto_pagomovil) / NULLIF(tasa_cambio, 0) ELSE (monto_efectivo + monto_pagomovil) END) FROM pagos_reportados WHERE cooperativa_id = ? AND estado = 'aprobado') as total_revenue,
                                (SELECT SUM(CASE WHEN moneda = 'Bs' THEN monto / NULLIF(tasa_cambio, 0) ELSE monto END) FROM gastos WHERE cooperativa_id = ?) as total_expenses");
    $stmtTotals->execute([$coop_id, $coop_id]);
    $totals = $stmtTotals->fetch();

    sendResponse([
        'revenueTrend' => $revenueTrend,
        'expensesTrend' => $expensesTrend,
        'topDrivers' => $topDrivers,
        'fuelStats' => $fuelStats,
        'totals' => [
            'revenue' => (float)($totals['total_revenue'] ?? 0),
            'expenses' => (float)($totals['total_expenses'] ?? 0),
            'net' => (float)($totals['total_revenue'] ?? 0) - (float)($totals['total_expenses'] ?? 0)
        ]
    ]);
} catch (Exception $e) {
    sendResponse(['error' => 'Database error', 'msg' => $e->getMessage()], 500);
}
