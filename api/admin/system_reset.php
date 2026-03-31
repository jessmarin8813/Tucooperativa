<?php
/**
 * TuCooperativa - Deep System Reset (Audit & Routes)
 * WARNING: This script clears all historical route and payment data.
 * Use for testing purposes only.
 */
require_once __DIR__ . '/../includes/db.php';

// Manual Security Lock: Comment out or delete this block to run
// die("SECURITY LOCK: Enable this script manually in api/admin/system_reset.php");

try {
    $db = DB::getInstance();
    $db->beginTransaction();

    echo "Starting Deep Reset...\n";

    // Disable foreign key checks for clean truncation
    $db->exec("SET FOREIGN_KEY_CHECKS = 0");

    $tables = [
        'rutas',
        'odometros',
        'pagos_reportados',
        'pagos_diarios',
        'incidencias',
        'rutas_detalle' // if exists
    ];

    foreach ($tables as $table) {
        try {
            $db->exec("TRUNCATE TABLE $table");
            echo "[SUCCESS] Table '$table' reset.\n";
        } catch (Exception $e) {
            echo "[INFO] Table '$table' skip/not found: " . $e->getMessage() . "\n";
        }
    }

    // Reset vehicle last_odo if needed (optional)
    // $db->exec("UPDATE vehiculos SET kilometraje = 0");

    $db->exec("SET FOREIGN_KEY_CHECKS = 1");
    $db->commit();

    echo "\n[DEEP RESET COMPLETE] The system is now a clean slate for testing.\n";

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    echo "[CRITICAL ERROR] Reset failed: " . $e->getMessage() . "\n";
}
?>
