<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();
$roles = $db->query("SELECT rol, COUNT(*) as count FROM usuarios GROUP BY rol")->fetchAll();
echo json_encode($roles, JSON_PRETTY_PRINT);
