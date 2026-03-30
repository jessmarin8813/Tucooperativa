<?php
/**
 * API (Admin): Rentabilidad e Inteligencia
 * Path: api/admin/rentabilidad.php
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();
$coop_id = $user['cooperativa_id'];

// 1. Get Global Stats
// Ingreso Proyectado: (Unidades * Dias * Cuota)
// Recaudación Real: Suma de abonos aprobados
// Gastos: Suma de mantenimientos y gastos operativos

$sql_global = "SELECT 
    (SELECT COALESCE(SUM(v.cuota_diaria * (SELECT COUNT(DISTINCT DATE(started_at)) FROM rutas WHERE vehiculo_id = v.id)), 0) 
     FROM vehiculos v WHERE v.cooperativa_id = :cp1) as proyectado,
    
    (SELECT COALESCE(SUM(CASE WHEN moneda = 'Bs' THEN (monto_efectivo + monto_pagomovil) / NULLIF(tasa_cambio, 0) ELSE (monto_efectivo + monto_pagomovil) END), 0) FROM pagos_reportados WHERE estado = 'aprobado' AND cooperativa_id = :cp2) as recaudado,
    
    (SELECT COALESCE(SUM(costo), 0) FROM mantenimiento_items mi 
     JOIN vehiculos v ON v.id = mi.vehiculo_id WHERE v.cooperativa_id = :cp3) as gastos_mante,
    
    (SELECT COALESCE(SUM(CASE WHEN moneda = 'Bs' THEN monto / NULLIF(tasa_cambio, 0) ELSE monto END), 0) FROM gastos WHERE cooperativa_id = :cp4) as gastos_oper";

$stmt = $db->prepare($sql_global);
$stmt->execute([
    'cp1' => $coop_id,
    'cp2' => $coop_id,
    'cp3' => $coop_id,
    'cp4' => $coop_id
]);
$stats = $stmt->fetch();

$total_gastos = $stats['gastos_mante'] + $stats['gastos_oper'];
$utilidad_neta = $stats['recaudado'] - $total_gastos;
$eficiencia = $stats['proyectado'] > 0 ? ($stats['recaudado'] / $stats['proyectado']) * 100 : 0;

// 2. Performace per Vehicle
$sql_units = "SELECT 
    v.id, v.placa, v.cuota_diaria,
    (SELECT COUNT(DISTINCT DATE(started_at)) FROM rutas WHERE vehiculo_id = v.id) as dias,
    (SELECT COALESCE(SUM(CASE WHEN moneda = 'Bs' THEN (monto_efectivo + monto_pagomovil) / NULLIF(tasa_cambio, 0) ELSE (monto_efectivo + monto_pagomovil) END), 0) FROM pagos_reportados WHERE vehiculo_id = v.id AND estado = 'aprobado') as abonos,
    (SELECT COALESCE(SUM(costo), 0) FROM mantenimiento_items WHERE vehiculo_id = v.id) as costos_mante
    FROM vehiculos v
    WHERE v.cooperativa_id = :coop_id";

$stmt = $db->prepare($sql_units);
$stmt->execute(['coop_id' => $coop_id]);
$units = $stmt->fetchAll();

foreach ($units as &$u) {
    $u['proyectado'] = $u['dias'] * $u['cuota_diaria'];
    $u['utilidad'] = $u['abonos'] - $u['costos_mante'];
    // Health Check: Gasta más del 80% de lo que abona?
    $u['alerta_salud'] = ($u['abonos'] > 0 && ($u['costos_mante'] / $u['abonos']) > 0.8);
}

sendResponse([
    'global' => [
        'proyectado' => $stats['proyectado'],
        'recaudado' => $stats['recaudado'],
        'gastos' => $total_gastos,
        'utilidad_neta' => $utilidad_neta,
        'eficiencia_cobro' => round($eficiencia, 2)
    ],
    'unidades' => $units
]);
