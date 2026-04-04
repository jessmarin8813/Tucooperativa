<?php
/**
 * API (Admin): Get Collection Data
 * Path: api/admin/cobranza.php
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();
$coop_id = $user['cooperativa_id'];

// 1. Get Summary of Debt
// Formula: (Days Active * Cuota) - (Total Approved Payments)
$sql = "SELECT v.id, v.placa, v.cuota_diaria, u.nombre as chofer,
        (SELECT COUNT(DISTINCT DATE(started_at)) FROM rutas WHERE vehiculo_id = v.id) as dias_trabajados,
        (SELECT COALESCE(SUM(CASE WHEN moneda = 'Bs' THEN monto / NULLIF(tasa_cambio, 0) ELSE monto END), 0) FROM pagos_reportados WHERE vehiculo_id = v.id AND estado = 'aprobado') as abonos_totales,
        (SELECT COALESCE(SUM(CASE WHEN moneda = 'Bs' THEN monto_efectivo / NULLIF(tasa_cambio, 0) ELSE (CASE WHEN metodo = 'Efectivo (USD)' THEN monto ELSE 0 END) END), 0) FROM pagos_reportados WHERE vehiculo_id = v.id AND estado = 'aprobado') as abonos_efectivo,
        (SELECT COALESCE(SUM(CASE WHEN moneda = 'Bs' THEN monto_pagomovil / NULLIF(tasa_cambio, 0) ELSE (CASE WHEN metodo = 'Pago Móvil' OR metodo = 'Transferencia' THEN monto ELSE 0 END) END), 0) FROM pagos_reportados WHERE vehiculo_id = v.id AND estado = 'aprobado') as abonos_digital
        FROM vehiculos v
        JOIN choferes u ON v.chofer_id = u.id
        WHERE v.cooperativa_id = :coop_id";

$stmt = $db->prepare($sql);
$stmt->execute(['coop_id' => $coop_id]);
$fleet = $stmt->fetchAll();

foreach ($fleet as &$f) {
    $deuda_total = $f['dias_trabajados'] * $f['cuota_diaria'];
    // Aplicamos redondeo para evitar discrepancias de punto flotante por tasa BCV
    $f['saldo_pendiente'] = round($deuda_total - $f['abonos_totales'], 2);
    $f['estado_solvencia'] = ($f['saldo_pendiente'] <= 0) ? 'solvente' : ($f['saldo_pendiente'] > $f['cuota_diaria'] * 3 ? 'critico' : 'deudor');
}

// 2. Get Pending Payments to approve
$stmt = $db->prepare("SELECT p.*, u.nombre as chofer, v.placa 
                     FROM pagos_reportados p
                     JOIN choferes u ON u.id = p.chofer_id
                     JOIN vehiculos v ON v.id = p.vehiculo_id
                     WHERE p.cooperativa_id = :coop_id AND p.estado = 'pendiente'
                     ORDER BY p.fecha_reportado DESC");
$stmt->execute(['coop_id' => $coop_id]);
$pendientes = $stmt->fetchAll();

// 3. Get Recent History (Last 50 processed)
$stmt = $db->prepare("SELECT p.*, u.nombre as chofer, v.placa 
                     FROM pagos_reportados p
                     JOIN choferes u ON u.id = p.chofer_id
                     JOIN vehiculos v ON v.id = p.vehiculo_id
                     WHERE p.cooperativa_id = :coop_id AND p.estado IN ('aprobado', 'rechazado')
                     ORDER BY p.fecha_revision DESC LIMIT 50");
$stmt->execute(['coop_id' => $coop_id]);
$historial = $stmt->fetchAll();

sendResponse([
    'resumen' => $fleet,
    'pendientes' => $pendientes,
    'historial' => $historial
]);
