<?php
require_once 'api/includes/db.php';
$name = $argv[1] ?? 'Jesus';
try {
    $db = DB::getInstance();
    $sql = "SELECT id, nombre, rol, pago_info FROM usuarios WHERE nombre LIKE ? OR username LIKE ?";
    $stmt = $db->prepare($sql);
    $stmt->execute(["%$name%", "%$name%"]);
    $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($res, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
