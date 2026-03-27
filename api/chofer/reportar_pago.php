<?php
/**
 * API (Driver): Report Payment (Refined for Phase 36)
 * Path: api/chofer/reportar_pago.php
 */
require_once __DIR__ . '/../includes/middleware.php';
require_once __DIR__ . '/../includes/realtime.php';
require_once __DIR__ . '/../includes/bcv_helper.php';

$user = checkAuth();
$db = DB::getInstance();
$user_id = $user['user_id'];
$coop_id = $user['cooperativa_id'];

$data = json_decode(file_get_contents('php://input'), true);
$m_efectivo = floatval($data['monto_efectivo'] ?? 0);
$m_pagomovil = floatval($data['monto_pagomovil'] ?? 0);
$monto_total = $m_efectivo + $m_pagomovil;
$comprobante = $data['comprobante'] ?? '';

if ($monto_total <= 0) {
    sendResponse(['error' => 'El monto debe ser mayor a cero'], 400);
}

// 1. Find the vehicle (linked to active route or last known)
$sql_v = "SELECT v.id, v.placa, u_admin.telegram_chat_id as admin_chat_id 
          FROM vehiculos v 
          JOIN usuarios u_admin ON u_admin.rol = 'admin' AND u_admin.cooperativa_id = v.cooperativa_id
          JOIN rutas r ON r.vehiculo_id = v.id
          WHERE r.chofer_id = :uid 
          ORDER BY r.started_at DESC LIMIT 1";
$stmt = $db->prepare($sql_v);
$stmt->execute(['uid' => $user_id]);
$v = $stmt->fetch();

if (!$v) {
    sendResponse(['error' => 'No se encontró una unidad vinculada a este chofer.'], 404);
}

// 2. Insert Reported Payment (Approved state = 'pendiente')
$moneda = $data['moneda'] ?? 'Bs'; // Default to Bs for drivers
$tasa_cambio = get_bcv_rate();

$stmt = $db->prepare("INSERT INTO pagos_reportados (cooperativa_id, vehiculo_id, chofer_id, monto, moneda, tasa_cambio, monto_efectivo, monto_pagomovil, comprobante_path, estado) 
                     VALUES (:coop_id, :vid, :uid, :total, :moneda, :tasa, :efectivo, :pm, :compro, 'pendiente')");
$stmt->execute([
    'coop_id' => $coop_id,
    'vid' => $v['id'],
    'uid' => $user_id,
    'total' => $monto_total,
    'moneda' => $moneda,
    'tasa' => $tasa_cambio,
    'efectivo' => $m_efectivo,
    'pm' => $m_pagomovil,
    'compro' => $comprobante
]);
$pago_id = $db->lastInsertId();

// 3. Notify Owner via Master Bot (Telegram)
if ($v['admin_chat_id']) {
    require_once __DIR__ . '/../includes/telegram_helper.php';
    $monto_usd = ($moneda === 'Bs') ? ($monto_total / $tasa_cambio) : $monto_total;
    
    $msg = "💰 **PAGO REPORTADO ({$moneda})**\n\n";
    $msg .= "Unidad: *{$v['placa']}*\n";
    $msg .= "Monto: *{$monto_total} {$moneda}*\n";
    if ($moneda === 'Bs') {
        $msg .= "Equivalente: *$" . number_format($monto_usd, 2) . " USD*\n";
        $msg .= "Tasa BCV: *{$tasa_cambio}*\n";
    }
    if ($m_efectivo > 0) $msg .= "💵 Efectivo: *{$m_efectivo} {$moneda}*\n";
    if ($m_pagomovil > 0) $msg .= "📱 Pago Móvil: *{$m_pagomovil} {$moneda}*\n";
    $msg .= "\n🔗 [REVISAR Y APROBAR](http://192.168.0.221/TuCooperativa/dist/?view=cobranza&pago={$pago_id})";
    
    sendTelegramNotification($v['admin_chat_id'], $msg, $coop_id);
}

// Broadcast Update to UI
broadcastRealtime('UPDATE_COBRANZA', ['message' => 'Nuevo pago reportado', 'cooperativa_id' => $coop_id]);

sendResponse(['success' => true, 'id' => $pago_id, 'message' => 'Pago reportado. El administrador lo revisará pronto.']);
