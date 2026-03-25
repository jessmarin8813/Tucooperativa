<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();

function sync_table($table, $columns) {
    global $db;
    echo "Sincronizando tabla: $table...\n";
    $existCols = $db->query("DESCRIBE $table")->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($columns as $col => $def) {
        if (!in_array($col, $existCols)) {
            echo " - Agregando columna: $col...\n";
            $db->query("ALTER TABLE $table ADD COLUMN $col $def");
        } else {
            echo " - $col ya presente.\n";
        }
    }
}

try {
    sync_table('vehiculos', [
        'km_por_litro' => 'DECIMAL(10,2) DEFAULT 8.00',
        'cuota_diaria' => 'DECIMAL(10,2) DEFAULT 0',
        'modelo' => 'VARCHAR(100)',
        'anio' => 'INT'
    ]);
    
    sync_table('rutas', [
        'combustible' => 'DECIMAL(10,2) DEFAULT 0'
    ]);
    
    echo "\n[OK] Sincronización de Esquema Exitosa.\n";
} catch (Exception $e) {
    echo "\n[ERROR] Fallo en la sincronización: " . $e->getMessage() . "\n";
    exit(1);
}
