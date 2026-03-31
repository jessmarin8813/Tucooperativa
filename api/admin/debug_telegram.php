<?php
/**
 * Telegram Debugger (Internal use)
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();

$stmt = $db->prepare("SELECT id, nombre, rol, telegram_id, telegram_chat_id, telegram_status FROM usuarios WHERE id = ?");
$stmt->execute([$user['user_id']]);
$db_user = $stmt->fetch();

sendResponse([
    'session_user' => $user,
    'db_user' => $db_user,
    'db_status' => [
        'has_id' => !empty($db_user['telegram_id']),
        'has_chat' => !empty($db_user['telegram_chat_id']),
        'status' => $db_user['telegram_status'] ?? 'N/A'
    ]
]);
