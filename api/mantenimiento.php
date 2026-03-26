<?php
require_once 'includes/db.php';
require_once 'includes/middleware.php';

$auth = checkAuth();
$db = DB::getInstance();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $vid = $_GET['vehiculo_id'] ?? null;
    if (!$vid) {
        $stmt = $db->prepare("SELECT * FROM mantenimientos WHERE cooperativa_id = ?");
        $stmt->execute([$auth['cooperativa_id']]);
    } else {
        $stmt = $db->prepare("SELECT * FROM mantenimientos WHERE vehiculo_id = ? AND cooperativa_id = ?");
        $stmt->execute([$vid, $auth['cooperativa_id']]);
    }
    echo json_encode($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $db->prepare("INSERT INTO mantenimientos (cooperativa_id, vehiculo_id, tipo, km_intervalo, km_restantes) 
                         VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $auth['cooperativa_id'],
        $data['vehiculo_id'],
        $data['tipo'],
        $data['km_intervalo'],
        $data['km_intervalo'] // Al crear, los km restantes son el intervalo completo
    ]);
    echo json_encode(['status' => 'success']);
}
