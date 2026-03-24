<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/middleware.php';

$auth = checkAuth();
if ($auth['rol'] !== 'superadmin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$db = DB::getInstance();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $nombre = $data['nombre'] ?? '';
    $rif = $data['rif'] ?? '';
    
    if (!$nombre) {
        echo json_encode(['error' => 'Nombre es requerido']);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO cooperativas (nombre, rif, status) VALUES (?, ?, 'activo')");
    $stmt->execute([$nombre, $rif]);
    
    echo json_encode(['status' => 'success', 'id' => $db->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->query("SELECT * FROM cooperativas");
    echo json_encode($stmt->fetchAll());
}
