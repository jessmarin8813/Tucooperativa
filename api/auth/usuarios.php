<?php
require_once '../includes/db.php';
require_once '../includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();

// List owners for Admin dropdown
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['list_owners'])) {
    if ($user['rol'] !== 'admin') {
        sendResponse(['error' => 'Unauthorized'], 403);
    }
    $coop_id = $user['cooperativa_id'];
    if (!$coop_id) {
        sendResponse(['error' => 'No organization assigned'], 403);
    }
    $stmt = $db->prepare("SELECT id, nombre, email FROM usuarios WHERE cooperativa_id = ? AND (rol = 'dueno' OR rol = 'admin')");
    $stmt->execute([$coop_id]);
    sendResponse($stmt->fetchAll());
    exit;
}

// Gatekeeper Check (Original logic)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['check_auth'])) {
    $tid = $_GET['telegram_id'] ?? '';
    $stmt = $db->prepare("SELECT u.status as u_status, c.status as c_status 
                         FROM usuarios u 
                         JOIN cooperativas c ON u.cooperativa_id = c.id 
                         WHERE u.telegram_id = ?");
    $stmt->execute([$tid]);
    $res = $stmt->fetch();
    
    if ($res && $res['u_status'] === 'activo' && $res['c_status'] === 'activo') {
        sendResponse(['status' => 'activo']);
    } else {
        sendResponse(['status' => 'suspendido']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['telegram_id'])) {
        sendResponse(['error' => 'No telegram_id provided'], 400);
    }

    $stmt = $db->prepare("UPDATE usuarios SET telegram_id = ? WHERE id = ?");
    $stmt->execute([$data['telegram_id'], $user['user_id']]);

    sendResponse(['status' => 'success', 'message' => 'Telegram account linked.']);
}
?>
