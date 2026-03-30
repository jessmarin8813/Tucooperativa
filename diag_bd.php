<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();

echo "--- INFORME DE DIAGNÓSTICO DE VINCULACIÓN ---\n";

// 1. Ver choferes
echo "\n[TABLA CHOFERES]\n";
$choferes = $db->query("SELECT id, nombre, cedula, telegram_id FROM choferes")->fetchAll();
foreach ($choferes as $c) {
    echo "ID: {$c['id']} | Nombre: {$c['nombre']} | Cédula: {$c['cedula']} | TG: {$c['telegram_id']}\n";
}

// 2. Ver vehículos y su chofer asignado
echo "\n[TABLA VEHICULOS]\n";
$vehiculos = $db->query("SELECT id, placa, chofer_id, cooperativa_id FROM vehiculos")->fetchAll();
foreach ($vehiculos as $v) {
    echo "ID: {$v['id']} | Placa: {$v['placa']} | Chofer_ID Asignado: " . ($v['chofer_id'] ?? 'NULL') . "\n";
}

// 3. Ver rutas recientes
echo "\n[TABLA RUTAS (Últimas 5)]\n";
$rutas = $db->query("SELECT id, chofer_id, vehiculo_id, estado, started_at FROM rutas ORDER BY id DESC LIMIT 5")->fetchAll();
foreach ($rutas as $r) {
    echo "Ruta: {$r['id']} | Chofer: {$r['chofer_id']} | Vid: {$r['vehiculo_id']} | Estado: {$r['estado']}\n";
}

// 4. Ver invitaciones
echo "\n[TABLA INVITACIONES]\n";
$inv = $db->query("SELECT id, token, vehiculo_id, usado FROM invitaciones")->fetchAll();
foreach ($inv as $i) {
    echo "ID: {$i['id']} | Token: {$i['token']} | Vid: {$i['vehiculo_id']} | Usado: {$i['usado']}\n";
}
?>
