<?php
require 'api/includes/db.php';
$db = DB::getInstance();
echo "--- VEHICULOS ---\n";
$stmt = $db->query('DESCRIBE vehiculos');
foreach($stmt->fetchAll() as $row) echo $row['Field'] . ' (' . $row['Type'] . ')\n';

echo "\n--- TABLES LIST ---\n";
$stmt = $db->query('SHOW TABLES');
foreach($stmt->fetchAll() as $row) echo current($row) . "\n";
