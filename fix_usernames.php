<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();
$db->query("UPDATE usuarios SET username = 'dueno' WHERE username = 'admin'");
$db->query("UPDATE usuarios SET username = 'encargado' WHERE username = 'superadmin'");
echo "Usernames updated.";
