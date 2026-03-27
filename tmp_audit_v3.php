<?php
require 'api/includes/db.php';
$db = DB::getInstance();
echo "--- ODOMETROS ---\n";
$stmt = $db->query('DESCRIBE odometros');
foreach($stmt->fetchAll() as $row) echo $row['Field'] . ' (' . $row['Type'] . ')\n';

echo "\n--- MANTENIMIENTO_ITEMS ---\n";
$stmt = $db->query('DESCRIBE mantenimiento_items');
foreach($stmt->fetchAll() as $row) echo $row['Field'] . ' (' . $row['Type'] . ')\n';
