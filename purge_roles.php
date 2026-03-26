<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();

try {
    // 1. Alter ENUM to remove admin/superadmin and add encargado
    $db->query("ALTER TABLE usuarios MODIFY COLUMN rol ENUM('dueno', 'chofer', 'encargado') NOT NULL");
    echo "Schema updated to encargado.\n";

    // 2. Migrate roles
    $db->query("UPDATE usuarios SET rol = 'encargado' WHERE rol = 'superadmin' OR rol = 'admin'");
    // Actually, ID 9 should be encargado and ID 10 should be dueno
    $db->query("UPDATE usuarios SET rol = 'encargado' WHERE id = 9");
    $db->query("UPDATE usuarios SET rol = 'dueno' WHERE id = 10");
    echo "Roles migrated to Encargado/Dueno.\n";

    // 3. Verify
    $users = $db->query("SELECT id, username, rol FROM usuarios")->fetchAll(PDO::FETCH_ASSOC);
    foreach($users as $u) {
        echo "ID: {$u['id']} | USER: {$u['username']} | ROLE: [{$u['rol']}]\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
