<?php
require_once 'api/includes/db.php';
$placa = $argv[1] ?? 'ABC-123';
try {
    $db = DB::getInstance();
    $sql = "SELECT u.id, u.nombre, u.pago_info 
            FROM vehiculos v 
            JOIN usuarios u ON v.dueno_id = u.id 
            WHERE v.placa = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute([$placa]);
    $res = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($res, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
