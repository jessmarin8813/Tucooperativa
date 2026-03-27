<?php
/**
 * Driver Invitations API (TuCooperativa)
 */
require_once '../includes/db.php';
require_once '../includes/middleware.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['token'])) {
    $token = $_GET['token'];
    $db = DB::getInstance();
    $stmt = $db->prepare("SELECT i.*, c.nombre as cooperativa_nombre, v.placa as vehiculo_placa, v.modelo as vehiculo_modelo 
                          FROM invitaciones i 
                          JOIN cooperativas c ON i.cooperativa_id = c.id 
                          LEFT JOIN vehiculos v ON i.vehiculo_id = v.id 
                          WHERE i.token = ? AND i.usado = FALSE");
    $stmt->execute([$token]);
    $inv = $stmt->fetch();
    if (!$inv) sendResponse(['error' => 'Invitación inválida o expirada'], 404);
    sendResponse($inv);
    exit;
}

$auth = checkAuth();
$db = DB::getInstance();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Listar invitaciones
    $stmt = $db->prepare("SELECT * FROM invitaciones WHERE cooperativa_id = ? ORDER BY created_at DESC");
    $stmt->execute([$auth['cooperativa_id']]);
    sendResponse($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $vehiculo_id = $data['vehiculo_id'] ?? null;
    
    // Generar un token único
    $token = bin2hex(random_bytes(16));
    
    $stmt = $db->prepare("INSERT INTO invitaciones (cooperativa_id, vehiculo_id, token) VALUES (?, ?, ?)");
    $stmt->execute([$auth['cooperativa_id'], $vehiculo_id, $token]);

    $bot_username = getenv('TELEGRAM_BOT_NAME') ?: 'TuCooperativa_bot';
    $link = "https://t.me/$bot_username?start=$token";
    
    sendResponse([
        'status' => 'success', 
        'token' => $token, 
        'link' => $link
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $stmt = $db->prepare("DELETE FROM invitaciones WHERE id = ? AND cooperativa_id = ?");
    $stmt->execute([$id, $auth['cooperativa_id']]);
    sendResponse(['status' => 'success']);
}
