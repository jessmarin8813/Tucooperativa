<?php
/**
 * Generate Telegram Link Token API
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();

try {
    $token = bin2hex(random_bytes(16));
    
    $stmt = $db->prepare("UPDATE usuarios SET telegram_link_token = ? WHERE id = ?");
    $stmt->execute([$token, $user['id']]);

    $bot_name = getenv('TELEGRAM_BOT_NAME') ?: 'TuCooperativa_bot'; // Fallback if not in env
    
    sendResponse([
        'success' => true, 
        'link' => "https://t.me/$bot_name?start=link_$token"
    ]);
} catch (Exception $e) {
    sendResponse(['error' => 'Database error', 'msg' => $e->getMessage()], 500);
}
