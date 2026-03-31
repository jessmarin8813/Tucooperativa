<?php
/**
 * NUCLEAR RESET (v52.0-Nuclear)
 * Wipe all INFRASTRUCTURE & TRANSACTIONS, keep MASTER OWNERS
 */
require_once __DIR__ . '/includes/DB.php';

try {
    $db = DB::getInstance();
    $db->beginTransaction();
    $db->exec("SET FOREIGN_KEY_CHECKS = 0");

    $tablesToTruncate = [
        'vehiculos',
        'choferes',
        'pagos_reportados',
        'pagos_diarios',
        'gastos',
        'rutas',
        'incidencias',
        'mantenimiento_items',
        'mantenimiento_catalogo',
        'notificaciones',
        'odometros',
        'invitaciones'
    ];

    echo "--- INICIANDO LIMPIEZA NUCLEAR (BORRADO DE FLOTA Y PERSONAL) ---\n";
    foreach ($tablesToTruncate as $table) {
        $db->exec("TRUNCATE TABLE $table");
        echo "DESTROYED: $table [OK]\n";
    }

    echo "--- LIMPIEZA DE CUENTAS DE ACCESO ---\n";
    // Conservamos solo la cuenta admin o superadmin maestra
    $db->exec("DELETE FROM usuarios WHERE username != 'admin' AND rol != 'superadmin'");
    echo "CLEANUP: Usuarios Secundarios [OK]\n";

    $db->exec("SET FOREIGN_KEY_CHECKS = 1");
    $db->commit();

    echo "\n[SUCCESS] Sistema en estado VIRGEN. Conservada cuenta de dueño.\n";
    echo "Estado: 0 Unidades, 0 Choferes, 0 Gastos.\n";
    echo "Timestamp: " . date('Y-m-d H:i:s') . "\n";

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->exec("SET FOREIGN_KEY_CHECKS = 1");
        $db->rollBack();
    }
    echo "\n[ERROR] El borrado nuclear ha fallado: " . $e->getMessage();
}
