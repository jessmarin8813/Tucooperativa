<?php
/**
 * Update Telegram Chat ID API
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['chat_id'])) {
    sendResponse(['error' => 'Missing chat_id'], 400);
}

try {
    $stmt = $db->prepare("UPDATE usuarios SET telegram_chat_id = ? WHERE id = ?");
    $stmt->execute([$input['chat_id'], $user['id']]);

    sendResponse(['success' => true, 'message' => 'Telegram ID actualizado']);
} catch (Exception $e) {
    sendResponse(['error' => 'Database error', 'msg' => $e->getMessage()], 500);
}
