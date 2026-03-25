<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();

try {
    $db->exec("ALTER TABLE rutas ADD COLUMN alerta_combustible TINYINT(1) DEFAULT 0 AFTER estado");
    echo "COLUMNA alerta_combustible AÑADIDA.\n";
} catch (Exception $e) {
    echo "COLUMNA YA EXISTE O ERROR: " . $e->getMessage() . "\n";
}
