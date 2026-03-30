<?php
/**
 * DATA RESET SCRIPT - v38.3.2 (FINAL)
 */
require_once __DIR__ . '/../includes/db.php';

$db = DB::getInstance();

try {
    $db->beginTransaction();

    echo "🧹 Limpiando reportes de fallas e incidencias...\n";
    $db->exec("DELETE FROM incidencias");
    $db->exec("DELETE FROM gastos");
    
    echo "🚛 Restaurando flota a estado 'activo'...\n";
    $db->exec("UPDATE vehiculos SET estado = 'activo'");

    echo "🔄 Poniendo a cero los contadores de mantenimiento...\n";
    // Sincronizamos 'ultimo_odometro' de cada item con la última lectura real 
    // de la unidad para que el progreso baje a 0%.
    $db->exec("UPDATE mantenimiento_items i 
               SET i.ultimo_odometro = COALESCE((
                   SELECT o.valor 
                   FROM odometros o 
                   JOIN rutas r ON o.ruta_id = r.id
                   WHERE r.vehiculo_id = i.vehiculo_id
                   ORDER BY o.created_at DESC LIMIT 1
               ), 0)");

    $db->commit();
    echo "✅ OPERACIÓN COMPLETA: Unidades reseteadas y sin fallas activas.";
} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    echo "❌ ERROR EN RESET: " . $e->getMessage();
}
