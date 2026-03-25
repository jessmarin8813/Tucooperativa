<?php
/**
 * API: Save Cooperative Configuration
 * Path: api/admin/save_config.php
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
if ($user['rol'] !== 'owner' && $user['rol'] !== 'admin' && $user['rol'] !== 'superadmin') {
    sendResponse(['error' => 'Forbidden'], 403);
}

$db = DB::getInstance();
$coop_id = $user['cooperativa_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['telegram_bot_token'])) {
        $stmt = $db->prepare("UPDATE cooperativas SET telegram_bot_token = :token WHERE id = :id");
        $stmt->execute([
            'token' => $data['telegram_bot_token'],
            'id' => $coop_id
        ]);
        
        sendResponse(['success' => true, 'message' => 'Configuración actualizada']);
    } else {
        sendResponse(['error' => 'No hay datos para actualizar'], 400);
    }
}

sendResponse(['error' => 'Method not allowed'], 405);
