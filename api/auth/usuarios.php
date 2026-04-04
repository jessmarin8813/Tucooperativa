<?php
require_once '../includes/db.php';
require_once '../includes/middleware.php';

$db = DB::getInstance();

// List owners for Admin dropdown
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['list_owners'])) {
    $user = checkAuth();
    if ($user['rol'] !== 'superadmin' && $user['rol'] !== 'dueno') {
        sendResponse(['error' => 'Unauthorized'], 403);
    }
    $coop_id = $user['cooperativa_id'];
    if (!$coop_id) {
        sendResponse(['error' => 'No organization assigned'], 403);
    }
    $stmt = $db->prepare("SELECT id, nombre, email FROM usuarios WHERE cooperativa_id = ? AND (rol = 'dueno')");
    $stmt->execute([$coop_id]);
    sendResponse($stmt->fetchAll());
    exit;
}

// Gatekeeper Check (Updated with Role and Multi-table support)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['check_auth'])) {
    $tid = $_GET['telegram_id'] ?? '';
    
    // 1. Check in Usuarios (Admins/Owners)
    $stmt = $db->prepare("SELECT u.id as user_id, u.nombre, u.rol,
                                 c.id as cooperativa_id, c.nombre as cooperativa_nombre,
                                 c.nombre_cooperativa, c.lema, c.logo_path, c.rif
                          FROM usuarios u 
                          JOIN cooperativas c ON u.cooperativa_id = c.id 
                          WHERE u.telegram_id = ?");
    $stmt->execute([$tid]);
    $res = $stmt->fetch();
    
    if ($res) {
        sendResponse([
            'status' => 'activo',
            'user_id' => $res['user_id'],
            'nombre' => $res['nombre'],
            'rol' => $res['rol'],
            'cooperativa_id' => $res['cooperativa_id'],
            'cooperativa_nombre' => $res['cooperativa_nombre'],
            'nombre_full' => $res['nombre_cooperativa'],
            'lema' => $res['lema'],
            'rif' => $res['rif'],
            'logo' => $res['logo_path']
        ]);
        exit;
    }

    // 2. Check in Choferes
    $stmt = $db->prepare("SELECT u.id as user_id, u.nombre, 
                                 c.id as cooperativa_id, c.nombre as cooperativa_nombre,
                                 c.nombre_cooperativa, c.lema, c.logo_path, c.rif
                          FROM choferes u 
                          JOIN cooperativas c ON u.cooperativa_id = c.id 
                          WHERE u.telegram_id = ?");
    $stmt->execute([$tid]);
    $res = $stmt->fetch();

    if ($res) {
        sendResponse([
            'status' => 'activo',
            'user_id' => $res['user_id'],
            'nombre' => $res['nombre'],
            'rol' => 'chofer',
            'cooperativa_id' => $res['cooperativa_id'],
            'cooperativa_nombre' => $res['cooperativa_nombre'],
            'nombre_full' => $res['nombre_cooperativa'],
            'lema' => $res['lema'],
            'rif' => $res['rif'],
            'logo' => $res['logo_path']
        ]);
        exit;
    }

    sendResponse(['status' => 'desconocido']);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = checkAuth();
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['telegram_id'])) {
        sendResponse(['error' => 'No telegram_id provided'], 400);
    }

    $stmt = $db->prepare("UPDATE usuarios SET telegram_id = ? WHERE id = ?");
    $stmt->execute([$data['telegram_id'], $user['user_id']]);

    sendResponse(['status' => 'success', 'message' => 'Telegram account linked.']);
}
