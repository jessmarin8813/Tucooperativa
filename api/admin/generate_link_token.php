<?php
/**
 * Generate Telegram Link Token API
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();
$role = $_GET['role'] ?? 'owner';

try {
    $token = bin2hex(random_bytes(16));
    $bot_name = getenv('TELEGRAM_BOT_NAME') ?: 'TuCooperativa_bot';

    if ($role === 'driver') {
        // Invite link for drivers (master link)
        $stmt = $db->prepare("INSERT INTO invitaciones (cooperativa_id, token) VALUES (?, ?)");
        $stmt->execute([$user['cooperativa_id'], $token]);
        $link = "https://t.me/$bot_name?start=$token";
    } else {
        // Direct link for owner/admin - ALLOW RE-LINKING (if they are the ones logged in)
        // We update the token even if already linked, so they can 'update' their ID if they lost it.
        $stmt = $db->prepare("UPDATE usuarios SET telegram_link_token = ? WHERE id = ?");
        $stmt->execute([$token, $user['id']]);
        $link = "https://t.me/$bot_name?start=link_$token";
    }
    
    sendResponse([
        'success' => true, 
        'token' => $token,
        'link' => $link
    ]);
} catch (Exception $e) {
    sendResponse(['error' => 'Database error', 'msg' => $e->getMessage()], 500);
}
