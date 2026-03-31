<?php
require_once __DIR__ . '/../includes/db.php';
$db = DB::getInstance();
echo "DB NAME: tu_cooperativa\n";
$stmt = $db->query("SHOW TABLES");
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
foreach ($tables as $table) {
    echo "TABLE: $table\n";
    $stmt2 = $db->query("DESCRIBE $table");
    $cols = $stmt2->fetchAll(PDO::FETCH_COLUMN);
    echo "  COLS: " . implode(", ", $cols) . "\n";
}
