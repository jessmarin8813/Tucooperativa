<?php
/**
 * DATA RESET SCRIPT - v38.5 (FULL JORNADAS & MAINTENANCE)
 * Deep cleaning to start fresh tests.
 */
require_once __DIR__ . '/../includes/db.php';

$db = DB::getInstance();

try {
    $db->beginTransaction();

    echo "🧹 Limpiando reportes de fallas e incidencias...\n";
    $db->exec("DELETE FROM incidencias");
    $db->exec("DELETE FROM gastos");
    
    echo "🛣️ Limpiando historial de RUTAS y ODÓMETROS...\n";
    // Nota: El orden importa si hay claves foráneas
    $db->exec("DELETE FROM odometros");
    $db->exec("DELETE FROM rutas");

    echo "🚛 Restaurando flota a estado inicial 'activo'...\n";
    $db->exec("UPDATE vehiculos SET estado = 'activo'");

    echo "🔄 Poniendo a cero los recordatorios de mantenimiento...\n";
    // Como borramos odometros, el último odómetro base será 0.
    $db->exec("UPDATE mantenimiento_items SET ultimo_odometro = 0");

    $db->commit();
    echo "✅ OPERACIÓN COMPLETA: Base de datos limpia (Rutas, Incidencias, Gastos). Flota lista para pruebas.";
} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    echo "❌ ERROR EN RESET: " . $e->getMessage();
}
