<?php
require_once 'api/includes/middleware.php';
$db = DB::getInstance();
$sql = "SELECT v.id, v.placa, v.estado, 
               (SELECT COUNT(*) FROM mantenimiento_items m WHERE m.vehiculo_id = v.id) as items_mante,
               (SELECT MAX((((SELECT valor FROM odometros WHERE ruta_id IN (SELECT id FROM rutas WHERE vehiculo_id = v.id) ORDER BY created_at DESC LIMIT 1) - m.ultimo_odometro) / m.frecuencia) * 100) 
                FROM mantenimiento_items m WHERE m.vehiculo_id = v.id) as progress
        FROM vehiculos v 
        WHERE v.placa IN ('ABC-123', 'BCA-213')";
$res = $db->query($sql)->fetchAll();
print_r($res);
?>
