<?php
/**
 * API: Get Cooperative Configuration
 * Path: api/admin/get_config.php
 */
require_once __DIR__ . '/../includes/middleware.php';
require_once __DIR__ . '/../includes/bcv_helper.php';

$user = checkAuth();
if (!in_array($user['rol'], ['superadmin', 'owner', 'admin', 'dueno'])) {
    sendResponse(['error' => 'Forbidden'], 403);
}

$db = DB::getInstance();
$coop_id = $user['cooperativa_id'];

try {
    $stmt = $db->prepare("SELECT 
        telegram_bot_token, telegram_bot_name, telegram_chat_id, cuota_diaria, moneda,
        banco_nombre, banco_tipo, banco_identidad, banco_telefono,
        nombre_cooperativa, rif, lema, logo_path
    FROM cooperativas WHERE id = :id");
    $stmt->execute(['id' => $coop_id]);
    $config = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$config) {
        sendResponse(['error' => 'Configuración no encontrada'], 404);
    }

    $config['user_telegram_chat_id'] = $user['telegram_chat_id'];
    $config['bcv_rate'] = get_bcv_rate();
    sendResponse($config);

} catch (Exception $e) {
    sendResponse(['error' => 'System error'], 500);
}
