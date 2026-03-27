<?php
require_once 'api/includes/db.php';
$vid = $argv[1] ?? 1;
try {
    $db = DB::getInstance();
    $sql = "SELECT * FROM vehiculos WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute([$vid]);
    $res = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($res, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
