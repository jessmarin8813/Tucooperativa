<?php
require_once __DIR__ . '/../includes/db.php';
$db = DB::getInstance();

try {
    echo "🧹 Saneando unidad ABC-123...\n";
    
    // 1. Cerrar todas las incidencias que tengan solucion NULL o vacía para el vehículo ABC-123
    $db->exec("UPDATE incidencias i 
               INNER JOIN vehiculos v ON i.vehiculo_id = v.id
               SET i.solucion = 'Saneamiento de auditoría v38.8', i.resolved_at = NOW() 
               WHERE v.placa = 'ABC-123' AND (i.solucion IS NULL OR i.solucion = '')");
    echo "✅ Incidencias cerradas.\n";
    
    // 2. Forzar estado activo
    $db->exec("UPDATE vehiculos SET estado = 'activo', status_changed_at = NOW() WHERE placa = 'ABC-123'");
    echo "✅ Unidad reactivada.\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage();
}
