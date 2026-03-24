<?php
require_once 'includes/db.php';
require_once 'includes/middleware.php';

// Gatekeeper Check
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['check_auth'])) {
    $tid = $_GET['telegram_id'] ?? '';
    $db = DB::getInstance();
    $stmt = $db->prepare("SELECT u.status as u_status, c.status as c_status 
                         FROM usuarios u 
                         JOIN cooperativas c ON u.cooperativa_id = c.id 
                         WHERE u.telegram_id = ?");
    $stmt->execute([$tid]);
    $res = $stmt->fetch();
    
    if ($res && $res['u_status'] === 'activo' && $res['c_status'] === 'activo') {
        echo json_encode(['status' => 'activo']);
    } else {
        echo json_encode(['status' => 'suspendido']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $auth = checkAuth();
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['telegram_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No telegram_id provided']);
        exit;
    }

    $db = DB::getInstance();
    $stmt = $db->prepare("UPDATE usuarios SET telegram_id = ? WHERE id = ?");
    $stmt->execute([$data['telegram_id'], $auth['user_id']]);

    echo json_encode(['status' => 'success', 'message' => 'Telegram account linked.']);
}
?>
