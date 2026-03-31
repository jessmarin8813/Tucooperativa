<?php
require_once __DIR__ . '/../includes/db.php';
$db = DB::getInstance();
$stmt = $db->query("DESCRIBE cooperativas");
echo json_encode($stmt->fetchAll());
