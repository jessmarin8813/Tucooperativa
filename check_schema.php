<?php
require 'api/includes/db.php';
$db = DB::getInstance();
$res = $db->query('DESCRIBE invitaciones');
echo json_encode($res->fetchAll());
?>
