<?php
require_once 'includes/db.php';
$table = $argv[1] ?? 'usuarios';
try {
    $db = DB::getInstance();
    $res = $db->query("DESCRIBE $table")->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($res, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
