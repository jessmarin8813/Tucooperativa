<?php
/**
 * API: Route Management (Admin/Owner Level)
 * Path: api/admin/rutas_admin.php
 */
require_once __DIR__ . '/../includes/middleware.php';
require_once __DIR__ . '/../includes/db.php';

$user = checkAuth();
$db = DB::getInstance();
$coop_id = $user['cooperativa_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

if ($action === 'exonerate') {
    $ruta_id = $data['ruta_id'] ?? null;
    
    if (!$ruta_id) {
        sendResponse(['error' => 'Ruta ID is required'], 400);
    }
    
    // Update the route state to 'exonerada' so it's excluded from debt calculation
    $stmt = $db->prepare("UPDATE rutas SET estado = 'exonerada' WHERE id = :rid AND cooperativa_id = :cid");
    $stmt->execute(['rid' => $ruta_id, 'cid' => $coop_id]);

    
    if ($stmt->rowCount() > 0) {
        sendResponse(['success' => true, 'message' => 'Ruta exonerada exitosamente']);
    } else {
        sendResponse(['error' => 'No se encontró la ruta o no tienes permisos'], 404);
    }
} else {
    sendResponse(['error' => 'Acción inválida'], 400);
}
