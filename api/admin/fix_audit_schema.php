<?php
require_once __DIR__ . '/../includes/db.php';

$db = DB::getInstance();

try {
    echo "🛠️ Actualizando esquema de auditoría...\n";
    
    // 1. Agregar resolved_at a incidencias si no existe
    $db->exec("ALTER TABLE incidencias ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP NULL DEFAULT NULL AFTER descripcion");
    echo "✅ Columna 'resolved_at' en incidencias: OK.\n";
    
    // 2. Asegurar status_changed_at en vehiculos
    // Check if column exists first (some DBs don't support ADD COLUMN IF NOT EXISTS for some versions)
    try {
        $db->exec("ALTER TABLE vehiculos ADD COLUMN status_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        echo "✅ Columna 'status_changed_at' en vehiculos: OK.\n";
    } catch (Exception $e2) {
        echo "ℹ️ 'status_changed_at' ya existía o hubo un aviso menor.\n";
    }

    echo "🏆 ESQUEMA SINCRONIZADO.\n";
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage();
}
