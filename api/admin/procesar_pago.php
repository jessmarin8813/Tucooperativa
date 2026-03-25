<?php
/**
 * API (Admin): Process Payment
 * Path: api/admin/procesar_pago.php
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth(); // Owner auth
$db = DB::getInstance();
$data = json_decode(file_get_contents('php://input'), true);

$pago_id = $data['id'] ?? null;
$accion = $data['accion'] ?? ''; // 'aprobado' o 'rechazado'
$notas = $data['notas'] ?? '';

if (!$pago_id || !in_array($accion, ['aprobado', 'rechazado'])) {
    sendResponse(['error' => 'Acción inválida'], 400);
}

// Update payment status
$stmt = $db->prepare("UPDATE pagos_reportados SET estado = :estado, fecha_revision = CURRENT_TIMESTAMP, revisado_por = :admin_id, notas = :notas 
                     WHERE id = :id AND cooperativa_id = :coop_id");
$stmt->execute([
    'estado' => $accion,
    'admin_id' => $user['id'],
    'notas' => $notas,
    'id' => $pago_id,
    'coop_id' => $user['cooperativa_id']
]);

// OPTIONAL: Notify Driver back via Telegram
// (Future work: bot callback)

sendResponse(['success' => true, 'message' => "Pago $accion correctamente"]);
