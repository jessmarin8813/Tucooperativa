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

// 1. INTENTO DE BUSCAR RUTA ACTIVA (Y DATOS DE FLOTA)
$sql = "SELECT 
    v.id as vehiculo_id, v.placa, v.cuota_diaria, v.estado as estado_unidad,
    (SELECT COUNT(DISTINCT DATE(started_at)) FROM rutas WHERE vehiculo_id = v.id AND chofer_id = :uid1 AND estado != 'exonerada') as dias,
    (SELECT COALESCE(SUM(monto), 0) FROM pagos_reportados WHERE chofer_id = :uid2 AND estado = 'aprobado') as abonos,
    (SELECT COALESCE(SUM(monto), 0) FROM pagos_reportados WHERE chofer_id = :uid3 AND estado = 'pendiente') as pendientes,
    (SELECT o.valor FROM odometros o JOIN rutas r2 ON o.ruta_id = r2.id WHERE r2.vehiculo_id = v.id ORDER BY o.created_at DESC LIMIT 1) as ultimo_km,
    c.banco_nombre, c.banco_tipo, c.banco_identidad, c.banco_telefono
    FROM vehiculos v
    JOIN cooperativas c ON v.cooperativa_id = c.id
    JOIN rutas r ON r.vehiculo_id = v.id
    WHERE r.chofer_id = :uid4 AND r.estado = 'activa'
    LIMIT 1";

$stmt = $db->prepare($sql);
$stmt->execute(['uid1' => $user_id, 'uid2' => $user_id, 'uid3' => $user_id, 'uid4' => $user_id]);
$data = $stmt->fetch();

if (!$data) {
    // 2. FALLBACK: BUSCAR VEHÍCULO ASIGNADO DIRECTAMENTE (PARA CHOFERES SIN RUTAS)
    $sql_fallback = "SELECT v.placa, v.estado as estado_unidad, c.banco_nombre, c.banco_tipo, c.banco_identidad, c.banco_telefono 
                    FROM vehiculos v 
                    JOIN cooperativas c ON v.cooperativa_id = c.id
                    WHERE v.chofer_id = :uid_fb 
                    LIMIT 1";
    $stmt = $db->prepare($sql_fallback);
    $stmt->execute(['uid_fb' => $user_id]);
    $data = $stmt->fetch();
    
    // Si aún no hay nada (chofer no asignado a unidad), buscar su última ruta conocida
    if (!$data) {
        $sql_last_route = "SELECT v.placa, v.estado as estado_unidad, c.banco_nombre, c.banco_tipo, c.banco_identidad, c.banco_telefono 
                          FROM rutas r 
                          JOIN vehiculos v ON r.vehiculo_id = v.id 
                          JOIN cooperativas c ON v.cooperativa_id = c.id
                          WHERE r.chofer_id = :uid_lr 
                          ORDER BY r.started_at DESC LIMIT 1";
        $stmt = $db->prepare($sql_last_route);
        $stmt->execute(['uid_lr' => $user_id]);
        $data = $stmt->fetch();
    }
    
    // Si después de todo, no hay nada:
    if (!$data) {
        $data = ['placa' => 'N/A'];
        // Obtener datos banca de la cooperativa del chofer directamente si falló lo demás
        $stmt_c = $db->prepare("SELECT banco_nombre, banco_tipo, banco_identidad, banco_telefono FROM cooperativas WHERE id = ?");
        $stmt_c->execute([$coop_id]);
        $coop_data = $stmt_c->fetch();
        if ($coop_data) {
            $data = array_merge($data, $coop_data);
        }
    }
    
    $data['ruta_activa'] = false;
    $data['deuda_bs'] = 0;
} else {
    $deuda = ($data['dias'] * $data['cuota_diaria']) - $data['abonos'];
    $data['deuda_bs'] = max(0, $deuda);
    $data['ruta_activa'] = true;
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
