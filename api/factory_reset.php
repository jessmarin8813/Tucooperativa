<?php
/**
 * FACTORY RESET (v51.0-Forense)
 * Wipe all TRANSACTIONAL data, keep structure (Users/Vehi/Coop)
 */
require_once __DIR__ . '/includes/DB.php';

try {
    $db = DB::getInstance();
    $db->beginTransaction();
    $db->exec("SET FOREIGN_KEY_CHECKS = 0");

    $tablesToTruncate = [
        'pagos_reportados',
        'pagos_diarios',
        'gastos',
        'rutas',
        'incidencias',
        'notificaciones',
        'odometros',
        'invitaciones'
    ];

    echo "--- INICIANDO LIMPIEZA PROFUNDA ---\n";
    foreach ($tablesToTruncate as $table) {
        $db->exec("TRUNCATE TABLE $table");
        echo "CLEAN: $table [OK]\n";
    }

    echo "--- RESETEANDO INFRAESTRUCTURA ---\n";
    // Reseteamos vehículos a estado ACTIVO y odómetro 0 (o el inicial)
    $db->exec("UPDATE vehiculos SET estado = 'activo', odometro_actual = 0, status_changed_at = NOW()");
    echo "RESET: Vehicles [OK]\n";

    // Reseteamos ítems preventivos de taller
    $db->exec("UPDATE mantenimiento_items SET ultimo_odometro = 0");
    echo "RESET: Maintenance Items [OK]\n";

    $db->exec("SET FOREIGN_KEY_CHECKS = 1");
    $db->commit();
    echo "\n[SUCCESS] Sistema en estado de Fabrica (Audit = 0, Infrastructure = Keep)\n";
    echo "Timestamp: " . date('Y-m-d H:i:s') . "\n";

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->exec("SET FOREIGN_KEY_CHECKS = 1");
        $db->rollBack();
    }
    echo "\n[ERROR] El reinicio total ha fallado: " . $e->getMessage();
}
