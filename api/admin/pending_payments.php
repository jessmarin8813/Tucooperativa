<?php
/**
 * Pending Payments API (Validation Queue)
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
if ($user['rol'] !== 'owner' && $user['rol'] !== 'superadmin') {
    sendResponse(['error' => 'Forbidden'], 403);
}

$db = DB::getInstance();

try {
    $stmt = $db->prepare("SELECT p.*, v.placa, u.nombre as chofer_nombre 
                          FROM pagos_diarios p
                          JOIN vehiculos v ON p.vehiculo_id = v.id
                          JOIN usuarios u ON p.usuario_id = u.id
                          WHERE p.cooperativa_id = ? AND p.estado = 'pendiente'
                          ORDER BY p.fecha DESC");
    $stmt->execute([$user['cooperativa_id']]);
    $payments = $stmt->fetchAll();

    sendResponse($payments);
} catch (Exception $e) {
    sendResponse(['error' => 'Database error', 'msg' => $e->getMessage()], 500);
}
