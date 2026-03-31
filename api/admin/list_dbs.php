<?php
$db = new PDO('mysql:host=localhost;charset=utf8mb4', 'root', '');
$stmt = $db->query("SHOW DATABASES");
echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
