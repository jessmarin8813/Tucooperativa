<?php
/**
 * Driver Invitations API (TuCooperativa)
 */
require_once 'includes/db.php';
require_once 'includes/middleware.php';

$auth = checkAuth();
$db = DB::getInstance();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Listar invitaciones
    $stmt = $db->prepare("SELECT * FROM invitaciones WHERE cooperativa_id = ? ORDER BY created_at DESC");
    $stmt->execute([$auth['cooperativa_id']]);
    sendResponse($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Generar un token único de 16 bytes (32 caracteres hex)
    $token = bin2hex(random_bytes(16));
    
    $stmt = $db->prepare("INSERT INTO invitaciones (cooperativa_id, token) VALUES (?, ?)");
    $stmt->execute([$auth['cooperativa_id'], $token]);

    $bot_username = "TuCooperativaBot"; // Update if different
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
