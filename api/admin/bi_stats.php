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
    // 1. Revenue trend (last 7 days)
    $stmtTrend = $db->prepare("SELECT fecha, SUM(monto_efectivo + monto_pagomovil) as total 
                               FROM pagos_diarios 
                               WHERE cooperativa_id = ? AND fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                               GROUP BY fecha ORDER BY fecha ASC");
    $stmtTrend->execute([$coop_id]);
    $revenueTrend = $stmtTrend->fetchAll();

    // 2. Expenses trend (last 7 days)
    $stmtExpTrend = $db->prepare("SELECT fecha, SUM(monto) as total 
                                  FROM gastos 
                                  WHERE cooperativa_id = ? AND fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                                  GROUP BY fecha ORDER BY fecha ASC");
    $stmtExpTrend->execute([$coop_id]);
    $expensesTrend = $stmtExpTrend->fetchAll();

    // 3. Top drivers by revenue (Using chofer_id from schema/recaudacion)
    $stmtDrivers = $db->prepare("SELECT u.nombre, SUM(p.monto_efectivo + p.monto_pagomovil) as total
                                 FROM pagos_diarios p
                                 JOIN usuarios u ON p.chofer_id = u.id
                                 WHERE p.cooperativa_id = ?
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

    // 5. Totals for highlight cards
    $stmtTotals = $db->prepare("SELECT 
                                (SELECT SUM(monto_efectivo + monto_pagomovil) FROM pagos_diarios WHERE cooperativa_id = ?) as total_revenue,
                                (SELECT SUM(monto) FROM gastos WHERE cooperativa_id = ?) as total_expenses");
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
