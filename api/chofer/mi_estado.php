<?php
/**
 * API (Chofer): Mi Estado Actual
 * Path: api/chofer/mi_estado.php
 */
require_once __DIR__ . '/../includes/middleware.php';
require_once __DIR__ . '/../includes/bcv_helper.php';

$user = checkAuth();
$db = DB::getInstance();
$user_id = $user['user_id'];
$coop_id = $user['cooperativa_id'];
$bcv_rate = get_bcv_rate();

// 1. OBTENER DATOS BÁSICOS DEL VEHÍCULO Y COOPERATIVA (SIEMPRE DISPONIBLES)
$sql_base = "SELECT v.id as vehiculo_id, v.placa, v.cuota_diaria, v.estado as estado_unidad,
            c.banco_nombre, c.banco_tipo, c.banco_identidad, c.banco_telefono, c.id as coop_id
            FROM vehiculos v
            JOIN cooperativas c ON v.cooperativa_id = c.id
            WHERE v.chofer_id = :uid_base 
            LIMIT 1";
$stmt = $db->prepare($sql_base);
$stmt->execute(['uid_base' => $user_id]);
$base_data = $stmt->fetch();

// 2. BUSCAR RUTA ACTIVA PARA DATOS DINÁMICOS (DEUDA, KM)
$data = $base_data ?: ['placa' => 'N/A', 'estado_unidad' => 'activo'];
$data['ruta_activa'] = false;

if ($base_data) {
    // Buscar si hay una jornada abierta
    $sql_route = "SELECT id, started_at FROM rutas WHERE chofer_id = :uid_r AND vehiculo_id = :vid AND estado = 'activa' LIMIT 1";
    $stmtR = $db->prepare($sql_route);
    $stmtR->execute(['uid_r' => $user_id, 'vid' => $base_data['vehiculo_id']]);
    $active_route = $stmtR->fetch();

    if ($active_route) {
        $data['ruta_activa'] = true;
    }

    // Estadísticas generales (Incluso sin ruta activa)
    $stmtStats = $db->prepare("SELECT 
        (SELECT COUNT(DISTINCT DATE(started_at)) FROM rutas WHERE vehiculo_id = :v1 AND chofer_id = :u1 AND estado != 'exonerada') as dias,
        (SELECT COALESCE(SUM(monto), 0) FROM pagos_reportados WHERE chofer_id = :u2 AND estado = 'aprobado') as abonos,
        (SELECT COALESCE(SUM(monto), 0) FROM pagos_reportados WHERE chofer_id = :u3 AND estado = 'pendiente') as pendientes,
        (SELECT o.valor FROM odometros o JOIN rutas r ON o.ruta_id = r.id WHERE r.vehiculo_id = :v2 ORDER BY o.created_at DESC LIMIT 1) as ultimo_km
    ");
    $stmtStats->execute(['v1' => $base_data['vehiculo_id'], 'u1' => $user_id, 'u2' => $user_id, 'u3' => $user_id, 'v2' => $base_data['vehiculo_id']]);
    $stats = $stmtStats->fetch();
    $data = array_merge($data, $stats);
    
    // Cálculo final de deuda
    $dias = floatval($data['dias'] ?? 0);
    $cuota = floatval($data['cuota_diaria'] ?? 0);
    $abonos = floatval($data['abonos'] ?? 0);
    $data['deuda_bs'] = max(0, ($dias * $cuota) - $abonos);

} else {
    // Lógica para choferes sin unidad
    $sql_last = "SELECT v.placa, v.estado as estado_unidad FROM rutas r JOIN vehiculos v ON r.vehiculo_id = v.id WHERE r.chofer_id = ? ORDER BY r.started_at DESC LIMIT 1";
    $stmtL = $db->prepare($sql_last);
    $stmtL->execute([$user_id]);
    $last = $stmtL->fetch();
    if ($last) {
        $data = array_merge($data, $last);
    }
}

// Formatear datos de pago
$pago_info = "Consulte al administrador";
if (!empty($data['banco_nombre'])) {
    $pago_info = "{$data['banco_nombre']} - {$data['banco_tipo']}\nCI/RIF: {$data['banco_identidad']}\nTelf: {$data['banco_telefono']}";
}

sendResponse([
    'placa' => $data['placa'] ?? 'N/A',
    'deuda' => floatval($data['deuda_bs'] ?? 0),
    'bcv_rate' => $bcv_rate,
    'pendientes' => floatval($data['pendientes'] ?? 0),
    'ultimo_km' => $data['ultimo_km'] ?? 0,
    'datos_bancarios' => $pago_info,
    'ruta_activa' => ($data['ruta_activa'] ?? false),
    'estado_unidad' => $data['estado_unidad'] ?? 'activo'
]);
