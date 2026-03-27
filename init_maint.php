<?php
require 'api/includes/db.php';
$db = DB::getInstance();

$vid = 1; // Ford Explorer ABC-123
$items = [
    ['nombre' => 'Cambio de Aceite', 'frecuencia' => 5000, 'ultimo_odo' => 0],
    ['nombre' => 'Frenos / Pastillas', 'frecuencia' => 20000, 'ultimo_odo' => 0],
    ['nombre' => 'Rotación de Cauchos', 'frecuencia' => 10000, 'ultimo_odo' => 0]
];

foreach ($items as $item) {
    $stmt = $db->prepare("INSERT INTO mantenimiento_items (vehiculo_id, nombre, frecuencia, ultimo_odometro) 
                         VALUES (:vid, :nombre, :frec, :odo)");
    $stmt->execute([
        'vid' => $vid,
        'nombre' => $item['nombre'],
        'frec' => $item['frecuencia'],
        'odo' => $item['ultimo_odo']
    ]);
    echo "Creado: {$item['nombre']} para Unidad $vid\n";
}
echo "\n✅ Alertas estándares inicializadas.\n";
