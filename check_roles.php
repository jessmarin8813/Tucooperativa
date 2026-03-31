<?php
require_once __DIR__ . '/api/includes/db.php';
$db = DB::getInstance();
try {
    $stmt = $db->prepare("SELECT DISTINCT rol FROM usuarios");
    $stmt->execute();
    $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "ROLES EN BD: " . implode(', ', $roles) . "\n";

    $stmt = $db->prepare("SELECT id, nombre, rol, telegram_chat_id FROM usuarios");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "USUARIOS REGISTRADOS:\n";
    foreach ($users as $u) {
        echo "- ID: {$u['id']} | Nombre: {$u['nombre']} | Rol: {$u['rol']} | Telegram: ".($u['telegram_chat_id'] ?? 'NO VINCULADO')."\n";
    }
} catch (Exception $e) {
    echo "ERROR DB: " . $e->getMessage();
}
