<?php
require_once __DIR__ . '/includes/DB.php';
$stmt = DB::getInstance()->query("DESCRIBE usuarios");
echo json_encode($stmt->fetchAll());
?>
