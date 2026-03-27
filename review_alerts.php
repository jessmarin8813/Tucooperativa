<?php
require 'api/includes/db.php';
$db = DB::getInstance();

echo "--- Vehiculos Registrados ---\n";
$stmt = $db->query("SELECT id, placa, modelo FROM vehiculos");
$vehicles = $stmt->fetchAll();
foreach($vehicles as $v) {
    echo "ID: {$v['id']} | Placa: {$v['placa']} | Modelo: {$v['modelo']}\n";
}

echo "\n--- Mantenimientos Creados ---\n";
$stmt = $db->query("SELECT m.*, v.placa 
                    FROM mantenimiento_items m 
                    JOIN vehiculos v ON m.vehiculo_id = v.id 
                    ORDER BY v.placa ASC");
$items = $stmt->fetchAll();
foreach($items as $i) {
    echo "Placa: {$i['placa']} | Item: {$i['nombre']} | Frecuencia: {$i['frecuencia']} KM\n";
}
