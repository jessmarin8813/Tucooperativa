<?php
require_once __DIR__ . '/../includes/db.php';

$db = DB::getInstance();

try {
    // Intentar alterar la tabla para permitir NULL en ruta_id
    $result = $db->exec("ALTER TABLE odometros MODIFY ruta_id INT(11) NULL");
    echo "✅ TABLA ODOMETROS ACTUALIZADA: ruta_id ahora permite NULL.\n";
    
    // También verificar si incidencias tiene ruta_id (opcional para el futuro)
    // $db->exec("ALTER TABLE incidencias MODIFY ruta_id INT(11) NULL");
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage();
}
