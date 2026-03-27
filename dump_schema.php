<?php
require_once 'api/includes/db.php';
try {
    $db = DB::getInstance();
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        echo "TABLE: $table\n";
        $cols = $db->query("DESCRIBE $table")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($cols as $col) {
            echo " - {$col['Field']} ({$col['Type']})\n";
        }
        echo "\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
