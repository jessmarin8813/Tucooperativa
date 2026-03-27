<?php
/**
 * API: Save Cooperative Configuration
 * Path: api/admin/save_config.php
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
if ($user['rol'] !== 'owner' && $user['rol'] !== 'admin' && $user['rol'] !== 'superadmin' && $user['rol'] !== 'dueno') {
    sendResponse(['error' => 'Forbidden'], 403);
}

$db = DB::getInstance();
$coop_id = $user['cooperativa_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $fields = [
        'telegram_bot_token', 'telegram_bot_name', 'telegram_chat_id', 'cuota_diaria', 'moneda',
        'banco_nombre', 'banco_tipo', 'banco_identidad', 'banco_telefono',
        'nombre_cooperativa', 'rif', 'lema', 'logo_path'
    ];
    
    $updates = [];
    $params = ['id' => $coop_id];
    
    foreach ($fields as $field) {
        if (isset($data[$field])) {
            $updates[] = "$field = :$field";
            $params[$field] = $data[$field];
        }
    }
    
    if (empty($updates)) {
        sendResponse(['error' => 'No hay datos para actualizar'], 400);
    }
    
    $sql = "UPDATE cooperativas SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    sendResponse(['success' => true, 'message' => 'Configuración actualizada']);
}

sendResponse(['error' => 'Method not allowed'], 405);
