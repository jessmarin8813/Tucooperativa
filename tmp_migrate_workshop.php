<?php
$db = new PDO('mysql:host=localhost;dbname=tu_cooperativa', 'root', '');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // 1. Añadir Diagnóstico y Solución a Incidencias
    $db->exec("ALTER TABLE incidencias ADD COLUMN diagnostico TEXT AFTER descripcion, ADD COLUMN solucion TEXT AFTER diagnostico");
    echo "OK: incidencias fields added\n";
} catch (Exception $e) { echo "INFO: incidencias fields might exist: " . $e->getMessage() . "\n"; }

try {
    // 2. Añadir Referencia a Incidencia en Gastos
    $db->exec("ALTER TABLE gastos ADD COLUMN incidencia_id INT DEFAULT NULL AFTER vehiculo_id");
    echo "OK: gastos field added\n";
} catch (Exception $e) { echo "INFO: gastos field might exist: " . $e->getMessage() . "\n"; }

try {
    // 3. (Opcional) Estado 'diagnostico' en vehiculos si queremos ser más granulares
    // Pero el usuario dijo que ya funciona 'mantenimiento'. Lo dejaremos así por ahora.
    echo "OK: Migration Complete\n";
} catch (Exception $e) { echo "ERROR: " . $e->getMessage() . "\n"; }
