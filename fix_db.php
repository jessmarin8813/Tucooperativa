<?php
require 'api/includes/db.php';
$db = DB::getInstance();
try {
    $db->exec('ALTER TABLE vehiculos ADD COLUMN chofer_id INT NULL AFTER dueno_id');
    echo 'OK - Columna añadida';
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo 'ALREADY EXISTS';
    } else {
        echo 'ERROR: ' . $e->getMessage();
    }
}
?>
