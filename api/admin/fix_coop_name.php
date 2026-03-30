<?php
require_once __DIR__ . '/../includes/db.php';

$db = DB::getInstance();
$name = 'TuCooperativa - NUEVA COOPERATIVA';
$db->prepare("UPDATE cooperativas SET nombre = ? WHERE id = ?")->execute([$name, $auth['cooperativa_id']]);

echo "Nombre actualizado a: $name";
