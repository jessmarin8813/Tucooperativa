<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();

try {
    // Intentar agregar la columna si no existe
    $db->exec("ALTER TABLE mantenimiento_items ADD COLUMN costo DECIMAL(10,2) DEFAULT 0");
    echo "COLUMNA costo AÑADIDA O EXISTENTE.\n";
} catch (Exception $e) {
    echo "INFO: " . $e->getMessage() . "\n";
}

// Verificar columnas actuales
$stmt = $db->query("SHOW COLUMNS FROM mantenimiento_items");
$cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
echo "COLUMNAS ACTUALES: " . implode(", ", $cols) . "\n";
