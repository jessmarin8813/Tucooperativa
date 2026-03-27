<?php
/**
 * Migration: Restore 'monto' for compatibility
 * Version: v36.4.2
 */
require_once __DIR__ . '/api/includes/db.php';

try {
    $db = DB::getInstance();
    
    echo "[MIGRATION] Checking pagos_reportados columns...\n";
    $cols = $db->query("SHOW COLUMNS FROM pagos_reportados")->fetchAll(PDO::FETCH_COLUMN);
    
    if (in_array('monto_total', $cols) && !in_array('monto', $cols)) {
        echo "Renaming 'monto_total' back to 'monto'...\n";
        $db->exec("ALTER TABLE pagos_reportados CHANGE COLUMN monto_total monto DECIMAL(10,2)");
    } elseif (!in_array('monto', $cols)) {
        echo "Creating 'monto' column...\n";
        $db->exec("ALTER TABLE pagos_reportados ADD COLUMN monto DECIMAL(10,2) DEFAULT 0 AFTER chofer_id");
    }

    echo "[SUCCESS] Field 'monto' restored. System compatibility re-established.\n";
    
} catch (Exception $e) {
    echo "[ERROR] Restoration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
