<?php
require_once __DIR__ . '/../includes/db.php';
$db = DB::getInstance();
$stmt = $db->query("DESCRIBE pagos_reportados");
echo json_encode($stmt->fetchAll());
?>
