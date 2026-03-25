<?php
/**
 * Validate Payment API
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
if ($user['rol'] !== 'owner' && $user['rol'] !== 'superadmin') {
    sendResponse(['error' => 'Forbidden'], 403);
}

$db = DB::getInstance();
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['pago_id']) || !isset($input['status'])) {
    sendResponse(['error' => 'Missing data'], 400);
}

if (!in_array($input['status'], ['validado', 'rechazado'])) {
    sendResponse(['error' => 'Invalid status'], 400);
}

try {
    $stmt = $db->prepare("UPDATE pagos_diarios SET estado = ? WHERE id = ? AND cooperativa_id = ?");
    $stmt->execute([$input['status'], $input['pago_id'], $user['cooperativa_id']]);

    if ($stmt->rowCount() > 0) {
        sendResponse(['success' => true, 'id' => $input['pago_id'], 'new_status' => $input['status']]);
    } else {
        sendResponse(['error' => 'Payment not found or access denied'], 404);
    }
} catch (Exception $e) {
    sendResponse(['error' => 'Database error', 'msg' => $e->getMessage()], 500);
}
