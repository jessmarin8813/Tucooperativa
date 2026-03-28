<?php
require_once __DIR__ . '/api/includes/db.php';

$db = DB::getInstance();
try {
    $db->beginTransaction();

    // 1. Get the last route ID (to be safe, only the most recent one)
    $stmt = $db->query("SELECT id FROM rutas ORDER BY id DESC LIMIT 1");
    $route_id = $stmt->fetchColumn();

    if ($route_id) {
        echo "Eliminando registros asociados a la Ruta ID: $route_id\n";
        
        // Delete related odometers
        $db->prepare("DELETE FROM odometros WHERE ruta_id = ?")->execute([$route_id]);
        
        // Delete related payments
        $db->prepare("DELETE FROM pagos_reportados WHERE id_ruta = ?")->execute([$route_id]);
        
        // Delete the route itself
        $db->prepare("DELETE FROM rutas WHERE id = ?")->execute([$route_id]);
        
        echo "✅ Limpieza completada exitosamente.\n";
    } else {
        echo "⚠️ No se encontraron rutas para eliminar.\n";
    }

    $db->commit();
} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    echo "❌ Error en la limpieza: " . $e->getMessage() . "\n";
}
?>
