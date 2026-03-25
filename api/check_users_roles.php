<?php
require_once 'includes/db.php';
$db = DB::getInstance();
$stmt = $db->query("SELECT id, username, email, rol, cooperativa_id FROM usuarios");
echo "USUARIOS EN SISTEMA:\n";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
