<?php
/**
 * Financial Reports API (TuCooperativa)
 */
require_once '../includes/db.php';
require_once '../includes/middleware.php';

$auth = checkAuth();
$db = DB::getInstance();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $coop_id = $auth['cooperativa_id'];
    
    // 1. Resumen General (Total Historico)
    $stmt = $db->prepare("SELECT 
                            SUM(monto_efectivo) as total_efectivo,
                            SUM(monto_pagomovil) as total_pagomovil,
                            SUM(monto) as total_esperado
                          FROM pagos_diarios 
                          WHERE cooperativa_id = ?");
    $stmt->execute([$coop_id]);
    $resumen = $stmt->fetch();

    // 2. Ingresos por Día (Últimos 7 días)
    $stmt = $db->prepare("SELECT 
                            fecha,
                            SUM(monto_efectivo) as efectivo,
                            SUM(monto_pagomovil) as pagomovil
                          FROM pagos_diarios 
                          WHERE cooperativa_id = ?
                          GROUP BY fecha 
                          ORDER BY fecha DESC 
                          LIMIT 7");
    $stmt->execute([$coop_id]);
    $por_dia = $stmt->fetchAll();

    // 3. Detalle de Pagos Recientes
    $stmt = $db->prepare("SELECT 
                            p.*, 
                            v.placa, 
                            u.nombre as chofer_nombre 
                          FROM pagos_diarios p
                          JOIN vehiculos v ON p.vehiculo_id = v.id
                          JOIN usuarios u ON p.chofer_id = u.id
                          WHERE p.cooperativa_id = ?
                          ORDER BY p.fecha DESC, p.created_at DESC
                          LIMIT 20");
    $stmt->execute([$coop_id]);
    $recientes = $stmt->fetchAll();

    // 4. Datos de la Cooperativa (Settings)
    $stmt = $db->prepare("SELECT * FROM cooperativas WHERE id = ?");
    $stmt->execute([$coop_id]);
    $cooperativa = $stmt->fetch();

    sendResponse([
        'resumen' => $resumen,
        'grafico' => array_reverse($por_dia),
        'recientes' => $recientes,
        'cooperativa' => $cooperativa
    ]);
}
