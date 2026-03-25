<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();
$coop_id = 1;

try {
    $incidencias = [];
    $query = "
        SELECT 
            v.placa, v.km_por_litro as target_kpl,
            r.id, r.started_at, r.ended_at, r.combustible,
            u.nombre as chofer_nombre,
            c.nombre as coop_nombre,
            odo_ini.valor as odo_inicio,
            odo_fin.valor as odo_fin
        FROM rutas r
        JOIN usuarios u ON r.chofer_id = u.id
        JOIN cooperativas c ON r.cooperativa_id = c.id
        JOIN vehiculos v ON r.vehiculo_id = v.id
        JOIN odometros odo_ini ON r.id = odo_ini.ruta_id AND odo_ini.tipo = 'inicio'
        JOIN odometros odo_fin ON r.id = odo_fin.ruta_id AND odo_fin.tipo = 'fin'
        WHERE r.estado = 'finalizada'
        AND r.cooperativa_id = $coop_id
        ORDER BY v.id, r.ended_at DESC
        LIMIT 200
    ";

    echo "EJECUTANDO QUERY PRINCIPAL...\n";
    $stmt = $db->query($query);
    $routes = $stmt->fetchAll();
    echo "CUENTA DE RUTAS: " . count($routes) . "\n";

    $query_caja = "
        SELECT r.id, r.ended_at, u.nombre as chofer_nombre, c.nombre as coop_nombre
        FROM rutas r
        JOIN usuarios u ON r.chofer_id = u.id
        JOIN cooperativas c ON r.cooperativa_id = c.id
        LEFT JOIN pagos_reportados p ON r.id = p.ruta_id
        WHERE r.estado = 'finalizada'
        AND r.ended_at < (NOW() - INTERVAL 12 HOUR)
        AND p.id IS NULL
        AND r.cooperativa_id = $coop_id
        LIMIT 50
    ";
    echo "EJECUTANDO QUERY CAJA...\n";
    $stmtCaja = $db->query($query_caja);
    $cajas = $stmtCaja->fetchAll();
    echo "CUENTA DE CAJAS: " . count($cajas) . "\n";

    echo "SUCCESS\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
