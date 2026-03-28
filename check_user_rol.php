<?php
require_once __DIR__ . '/api/includes/db.php';
$db = DB::getInstance();
$stmt = $db->query("SELECT id, username, rol FROM usuarios");
while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    print_r($row);
}
?>
