<?php
/**
 * Migration: Add mantenimiento_item_id to gastos
 * Version: v36.2.2
 */
require_once __DIR__ . '/api/includes/db.php';

try {
    $db = DB::getInstance();
    
    echo "[MIGRATION] Checking table 'gastos'...\n";
    
    // Check if column exists
    $stmt = $db->query("SHOW COLUMNS FROM gastos LIKE 'mantenimiento_item_id'");
    $exists = $stmt->fetch();
    
    if (!$exists) {
        echo "[MIGRATION] Adding column 'mantenimiento_item_id' to 'gastos'...\n";
        $db->exec("ALTER TABLE gastos ADD COLUMN mantenimiento_item_id INT NULL AFTER vehiculo_id");
        $db->exec("ALTER TABLE gastos ADD INDEX (mantenimiento_item_id)");
        echo "[SUCCESS] Column added.\n";
    } else {
        echo "[INFO] Column 'mantenimiento_item_id' already exists.\n";
    }
    
    echo "[MIGRATION] Migration completed successfully.\n";
    
} catch (Exception $e) {
    echo "[ERROR] Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
