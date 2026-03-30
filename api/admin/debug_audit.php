<?php
require_once __DIR__ . '/../includes/db.php';
$db = DB::getInstance();

echo "--- VEHICULOS ---\n";
$vs = $db->query("SELECT id, placa, estado, status_changed_at FROM vehiculos")->fetchAll(PDO::FETCH_ASSOC);
print_r($vs);

echo "\n--- INCIDENCIAS ACTIVAS (solucion IS NULL) ---\n";
$is = $db->query("SELECT id, vehiculo_id, tipo, solucion, resolved_at FROM incidencias WHERE solucion IS NULL")->fetchAll(PDO::FETCH_ASSOC);
print_r($is);

echo "\n--- INCIDENCIAS CERRADAS (solucion IS NOT NULL) ---\n";
$is2 = $db->query("SELECT id, vehiculo_id, tipo, solucion, resolved_at FROM incidencias WHERE solucion IS NOT NULL")->fetchAll(PDO::FETCH_ASSOC);
print_r($is2);
