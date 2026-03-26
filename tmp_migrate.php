<?php
/**
 * Schema Update: Add company fields to cooperativas table
 */
require_once __DIR__ . '/api/includes/db.php';

$db = DB::getInstance();

try {
    // Check columns
    $stmt = $db->query("DESCRIBE cooperativas");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $to_add = [
        'nombre_cooperativa' => "VARCHAR(255) DEFAULT 'Nueva Cooperativa'",
        'rif' => "VARCHAR(50) DEFAULT 'J-00000000-0'",
        'lema' => "VARCHAR(255) DEFAULT 'Transporte Eficiente'"
    ];
    
    foreach ($to_add as $col => $def) {
        if (!in_array($col, $columns)) {
            $db->exec("ALTER TABLE cooperativas ADD COLUMN $col $def");
            echo "Column '$col' added.\n";
        } else {
            echo "Column '$col' already exists.\n";
        }
    }
    
    echo "Schema update complete.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
