<?php
/**
 * API: Update Bot Info (Auto-Discovery)
 * Path: api/system/update_bot_info.php
 * This endpoint allows the Bot to report its own username to the backend.
 */
require_once __DIR__ . '/../includes/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$bot_name = $data['bot_username'] ?? '';

if (!$bot_name) {
    http_response_code(400);
    echo json_encode(['error' => 'bot_username required']);
    exit;
}

try {
    $db = DB::getInstance();
    // Update ALL cooperatives with this bot name (In a single-instance SaaS, one bot serves all)
    $stmt = $db->prepare("UPDATE cooperativas SET telegram_bot_name = ?");
    $stmt->execute([$bot_name]);

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'updated_to' => $bot_name]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
