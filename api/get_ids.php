<?php
require_once __DIR__ . '/includes/DB.php';
$ids = DB::getInstance()->query("SELECT id FROM vehiculos")->fetchAll(PDO::FETCH_COLUMN);
echo json_encode($ids);
