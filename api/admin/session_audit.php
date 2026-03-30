<?php
require_once __DIR__ . '/../includes/db.php';
$db = DB::getInstance();

// Simular el usuario que está viendo la página
$u = $db->query("SELECT * FROM usuarios LIMIT 1")->fetch(PDO::FETCH_ASSOC);
$coop_id = $u['cooperativa_id'];

echo "--- SESIÓN --- \n";
echo "Usuario: {$u['nombre']} (ID: {$u['id']})\n";
echo "Cooperativa ID: $coop_id\n";

echo "--- INCIDENCIAS CERRADAS DE ESTA COOP --- \n";
$sql = "SELECT i.id, i.descripcion, i.solucion, v.placa 
        FROM incidencias i
        INNER JOIN vehiculos v ON i.vehiculo_id = v.id
        WHERE v.cooperativa_id = :cid 
        AND (i.solucion IS NOT NULL AND i.solucion != '')";
$stmt = $db->prepare($sql);
$stmt->execute(['cid' => $coop_id]);
$res = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($res)) {
    echo "❌ NO HAY REGISTROS QUE CUMPLAN EL CRITERIO EN LA COOP $coop_id\n";
} else {
    echo "✅ REGISTROS ENCONTRADOS: " . count($res) . "\n";
    print_r($res);
}

echo "--- REVISIÓN DE GASTOS ASOCIADOS --- \n";
foreach($res as $r) {
    $gid = $r['id'];
    $expenses = $db->query("SELECT * FROM gastos WHERE incidencia_id = $gid")->fetchAll(PDO::FETCH_ASSOC);
    echo "Incidencia #$gid ({$r['placa']}): " . count($expenses) . " gastos.\n";
}
