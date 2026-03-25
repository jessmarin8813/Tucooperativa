<?php
require_once 'api/includes/db.php';
try {
    $db = DB::getInstance();
    $cols = $db->query("DESCRIBE vehiculos")->fetchAll(PDO::FETCH_COLUMN);
    echo "COLUMNS IN VEHICULOS: " . implode(", ", $cols) . "\n";
    if (in_array('km_por_litro', $cols)) {
        echo "SUCCESS: km_por_litro EXISTS\n";
    } else {
        echo "FAIL: km_por_litro MISSING\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
