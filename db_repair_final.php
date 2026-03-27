<?php
/**
 * Migration: Master Repair & Schema Sync
 * Version: v36.4.0
 */
require_once __DIR__ . '/api/includes/db.php';

try {
    $db = DB::getInstance();
    
    echo "[MIGRATION] Syncing 'rutas' table...\n";
    // Adding missing payment and fuel columns to rutas
    $db->exec("ALTER TABLE rutas ADD COLUMN IF NOT EXISTS monto_efectivo DECIMAL(10,2) DEFAULT 0 AFTER estado");
    $db->exec("ALTER TABLE rutas ADD COLUMN IF NOT EXISTS monto_pagomovil DECIMAL(10,2) DEFAULT 0 AFTER monto_efectivo");
    $db->exec("ALTER TABLE rutas ADD COLUMN IF NOT EXISTS combustible_reportado DECIMAL(10,2) DEFAULT 0 AFTER combustible");
    
    echo "[MIGRATION] Syncing 'pagos_reportados' table...\n";
    // Ensure payments table has all required columns for the new reporting logic
    $cols = $db->query("SHOW COLUMNS FROM pagos_reportados")->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('monto_total', $cols)) {
        $db->exec("ALTER TABLE pagos_reportados CHANGE COLUMN monto monto_total DECIMAL(10,2)");
    }
    if (!in_array('monto_efectivo', $cols)) {
        $db->exec("ALTER TABLE pagos_reportados ADD COLUMN monto_efectivo DECIMAL(10,2) DEFAULT 0 AFTER monto_total");
    }
    if (!in_array('monto_pagomovil', $cols)) {
        $db->exec("ALTER TABLE pagos_reportados ADD COLUMN monto_pagomovil DECIMAL(10,2) DEFAULT 0 AFTER monto_efectivo");
    }
    
    echo "[MIGRATION] Creating root .env from bot/.env...\n";
    $bot_env = __DIR__ . '/bot/.env';
    $root_env = __DIR__ . '/.env';
    if (file_exists($bot_env) && !file_exists($root_env)) {
        copy($bot_env, $root_env);
        echo "✅ .env sincronizado.\n";
    }

    echo "[SUCCESS] System schema and environment repaired.\n";
    
} catch (Exception $e) {
    echo "[ERROR] Reparation failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
