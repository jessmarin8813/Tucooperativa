<?php
require 'api/includes/db.php';
$db = DB::getInstance();
$res = $db->query('DESCRIBE vehiculos');
echo json_encode($res->fetchAll());
?>
