<?php
require_once __DIR__ . '/api/includes/db.php';
$db = DB::getInstance();
$stmt = $db->query("SELECT id, nombre, rol, telegram_id, telegram_chat_id FROM usuarios WHERE rol IN ('admin', 'dueno')");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($users, JSON_PRETTY_PRINT);
?>
