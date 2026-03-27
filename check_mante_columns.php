<?php
require_once __DIR__ . '/api/includes/db.php';
$db = DB::getInstance();
$stmt = $db->query("DESCRIBE mantenimiento_items");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($columns, JSON_PRETTY_PRINT);
?>
