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

if ($monto_total <= 0) {
    sendResponse(['error' => 'El monto debe ser mayor a cero'], 400);
}

// 1. Find the vehicle & Check Debt Pre-Flight
$v = null;
$sql_check = "SELECT v.id as vid, v.placa, v.cuota_diaria, v.cooperativa_id,
            (SELECT COUNT(DISTINCT DATE(started_at)) FROM rutas WHERE vehiculo_id = v.id AND chofer_id = :u1 AND estado != 'exonerada') as dias,
            (SELECT COALESCE(SUM(CASE WHEN moneda = 'Bs' THEN monto / tasa_cambio ELSE monto END), 0) FROM pagos_reportados WHERE chofer_id = :u2 AND estado = 'aprobado') as abonos,
            (SELECT COALESCE(SUM(CASE WHEN moneda = 'Bs' THEN monto / tasa_cambio ELSE monto END), 0) FROM pagos_reportados WHERE chofer_id = :u3 AND estado = 'pendiente') as pendientes
            FROM vehiculos v WHERE v.chofer_id = :uid LIMIT 1";
$stmt = $db->prepare($sql_check);
$stmt->execute(['u1' => $user_id, 'u2' => $user_id, 'u3' => $user_id, 'uid' => $user_id]);
$v = $stmt->fetch();

if (!$v) {
    // Fallback: Last Route
    $sql_route = "SELECT v.id as vid, v.placa, v.cuota_diaria, v.cooperativa_id FROM vehiculos v 
                  JOIN rutas r ON r.vehiculo_id = v.id WHERE r.chofer_id = :uid_r ORDER BY r.started_at DESC LIMIT 1";
    $stmt = $db->prepare($sql_route);
    $stmt->execute(['uid_r' => $user_id]);
    $v = $stmt->fetch();
    if ($v) { $db->prepare("UPDATE vehiculos SET chofer_id = ? WHERE id = ?")->execute([$user_id, $v['vid']]); }
}

if (!$v) {
    sendResponse(['error' => 'No se encontró una unidad vinculada.'], 422);
}

// DEBT RESTRICTION (Effective Debt calculation)
$dias = floatval($v['dias'] ?? 0);
$cuota = floatval($v['cuota_diaria'] ?? 0);
$abonos = floatval($v['abonos'] ?? 0);
$pendientes = floatval($v['pendientes'] ?? 0);
$deuda_efectiva = ($dias * $cuota) - ($abonos + $pendientes);

if ($deuda_efectiva <= 0) {
    sendResponse(['error' => 'Usted se encuentra al día. No es necesario realizar pagos adicionales en este momento.'], 422);
}

// 2. Insert Reported Payment
$input = json_decode(file_get_contents('php://input'), true);
$m_efectivo = floatval($input['monto_efectivo'] ?? 0);
$m_pagomovil = floatval($input['monto_pagomovil'] ?? 0);
$total = $m_efectivo + $m_pagomovil;
$referencia = $input['referencia'] ?? null; // Last 4 digits
$comprobante = $input['comprobante'] ?? null;
$moneda = 'Bs';
$tasa_cambio = get_bcv_rate();

$stmt = $db->prepare("INSERT INTO pagos_reportados (cooperativa_id, vehiculo_id, chofer_id, monto, moneda, tasa_cambio, monto_efectivo, monto_pagomovil, referencia, comprobante_path, estado) 
                     VALUES (:coop_id, :vid, :uid, :total, :moneda, :tasa, :efectivo, :pm, :ref, :compro, 'pendiente')");
$stmt->execute([
    'coop_id' => $v['cooperativa_id'],
    'vid' => $v['vid'],
    'uid' => $user_id,
    'total' => $total,
    'moneda' => $moneda,
    'tasa' => $tasa_cambio,
    'efectivo' => $m_efectivo,
    'pm' => $m_pagomovil,
    'ref' => $referencia,
    'compro' => $comprobante
]);
$pago_id = $db->lastInsertId();

// 3. Notify Owner (EXCLUSIVE)
$stmt_owner = $db->prepare("SELECT telegram_chat_id FROM usuarios WHERE rol = 'dueno' AND cooperativa_id = ? AND telegram_chat_id IS NOT NULL LIMIT 1");
$stmt_owner->execute([$v['cooperativa_id']]);
$owner = $stmt_owner->fetch();

if ($owner) {
    require_once __DIR__ . '/../includes/telegram_helper.php';
    $msg = "💰 **PAGO REPORTADO**\n";
    $msg .= "🚛 Unidad: *{$v['placa']}*\n";
    if ($m_efectivo > 0) $msg .= "💵 Efectivo: *{$m_efectivo} Bs*\n";
    if ($m_pagomovil > 0) $msg .= "📱 Pago Móvil: *{$m_pagomovil} Bs*\n";
    if ($referencia) $msg .= "🔢 Ref (4 dígitos): `{$referencia}`\n";
    $msg .= "✨ Total: *{$total} Bs* (~$" . round($total/$tasa_cambio, 2) . ")\n";
    $msg .= "\n🔗 [REVISAR Y APROBAR](http://192.168.0.221/TuCooperativa/client/dist/?view=cobranza&pago={$pago_id})";
    
    sendTelegramNotification($owner['telegram_chat_id'], $msg, $v['cooperativa_id']);
}

// Broadcast Update to UI
broadcastRealtime('UPDATE_COBRANZA', ['message' => 'Nuevo pago reportado', 'cooperativa_id' => $coop_id]);

sendResponse(['success' => true, 'id' => $pago_id, 'message' => 'Pago reportado. El administrador lo revisará pronto.']);
