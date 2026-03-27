<?php
require 'api/includes/db.php';
$db = DB::getInstance();
$res = $db->query("SELECT v.id, v.placa, v.chofer_id, c.nombre as chofer_nombre 
                   FROM vehiculos v 
                   LEFT JOIN choferes c ON v.chofer_id = c.id 
                   WHERE v.placa = 'ABC-123'");
echo json_encode($res->fetch());
?>
