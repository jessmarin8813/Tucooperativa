<?php
/**
 * API (Chofer): Mi Estado Actual
 * Path: api/chofer/mi_estado.php
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();
$user_id = $user['user_id'];
$coop_id = $user['cooperativa_id'];

// 1. Get Solvency and Debt
// Deuda = (Dias trabajados * Cuota) - Pagos Aprobados
$sql = "SELECT 
    v.id as vehiculo_id, v.placa, v.cuota_diaria,
    (SELECT COUNT(DISTINCT DATE(started_at)) FROM rutas WHERE vehiculo_id = v.id AND chofer_id = :user_id) as dias,
    (SELECT COALESCE(SUM(monto), 0) FROM pagos_reportados WHERE chofer_id = :user_id AND estado = 'aprobado') as abonos,
    (SELECT COALESCE(SUM(monto), 0) FROM pagos_reportados WHERE chofer_id = :user_id AND estado = 'pendiente') as pendientes,
    (SELECT valor FROM odometros WHERE vehiculo_id = v.id ORDER BY fecha DESC LIMIT 1) as ultimo_km,
    u_dueno.pago_info as datos_dueno
    FROM vehiculos v
    JOIN usuarios u_dueno ON v.dueno_id = u_dueno.id
    JOIN rutas r ON r.vehiculo_id = v.id
    WHERE r.chofer_id = :user_id AND r.estado = 'activa'
    LIMIT 1";

$stmt = $db->prepare($sql);
$stmt->execute(['user_id' => $user_id]);
$data = $stmt->fetch();

if (!$data) {
    // Si no tiene ruta activa, buscamos su última unidad asignada
    $sql_inactive = "SELECT v.placa, u_dueno.pago_info as datos_dueno 
                    FROM vehiculos v 
                    JOIN usuarios u_dueno ON v.dueno_id = u_dueno.id
                    JOIN rutas r ON r.vehiculo_id = v.id
                    WHERE r.chofer_id = :user_id
                    ORDER BY r.started_at DESC LIMIT 1";
    $stmt = $db->prepare($sql_inactive);
    $stmt->execute(['user_id' => $user_id]);
    $data = $stmt->fetch() ?: ['placa' => 'N/A', 'datos_dueno' => 'Consulte al administrador'];
    $data['ruta_activa'] = false;
    $data['deuda_bs'] = 0; // Simplified for inactive
} else {
    $deuda = ($data['dias'] * $data['cuota_diaria']) - $data['abonos'];
    $data['deuda_bs'] = max(0, $deuda);
    $data['ruta_activa'] = true;
}

sendResponse([
    'placa' => $data['placa'],
    'deuda' => $data['deuda_bs'],
    'pendientes' => $data['pendientes'] ?? 0,
    'ultimo_km' => $data['ultimo_km'] ?? 0,
    'datos_bancarios' => $data['datos_dueno'],
    'ruta_activa' => $data['ruta_activa']
]);
