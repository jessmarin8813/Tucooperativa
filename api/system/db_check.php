<?php
require_once '../includes/db.php';
$db = DB::getInstance();
$stmt = $db->query("DESCRIBE mantenimiento_items");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
