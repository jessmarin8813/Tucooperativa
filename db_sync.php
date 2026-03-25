<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();

function addCol($table, $col, $type, $after = '') {
    global $db;
    try {
        $db->query("ALTER TABLE $table ADD COLUMN $col $type" . ($after ? " AFTER $after" : ""));
        echo "Added $col to $table\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "Column $col already exists in $table\n";
        } else {
            echo "Error adding $col to $table: " . $e->getMessage() . "\n";
        }
    }
}

// Vehiculos Missing Columns
addCol('vehiculos', 'km_por_litro', 'DECIMAL(10,2) DEFAULT 8.00', 'placa');
addCol('vehiculos', 'cuota_diaria', 'DECIMAL(10,2) DEFAULT 0', 'km_por_litro');
addCol('vehiculos', 'modelo', 'VARCHAR(100)', 'km_por_litro');
addCol('vehiculos', 'anio', 'INT', 'modelo');

// Rutas Missing Columns
addCol('rutas', 'combustible', 'DECIMAL(10,2) DEFAULT 0', 'alerta_combustible');

echo "Database sync complete.\n";
