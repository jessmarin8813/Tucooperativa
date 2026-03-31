<?php
require_once __DIR__ . '/includes/DB.php';
$db = DB::getInstance();
$stmt = $db->query("SHOW TABLES");
$tables = [];
while($row = $stmt->fetch(PDO::FETCH_NUM)) $tables[] = $row[0];
echo json_encode($tables);
?>
