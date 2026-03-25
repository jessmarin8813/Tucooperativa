<?php
/**
 * Migration: Add username to usuarios
 */
require_once __DIR__ . '/api/includes/db.php';
$db = DB::getInstance();

try {
    // 1. Add column
    $db->exec("ALTER TABLE usuarios ADD COLUMN username VARCHAR(100) NULL UNIQUE AFTER nombre");
    echo "COLUMNA username AÑADIDA.\n";
    
    // 2. Populate username from email (before '@') for existing users
    $stmt = $db->query("SELECT id, email FROM usuarios WHERE email IS NOT NULL AND username IS NULL");
    $users = $stmt->fetchAll();
    
    foreach ($users as $user) {
        $username = explode('@', $user['email'])[0];
        // Ensure uniqueness check if needed, but for now just update
        $db->prepare("UPDATE usuarios SET username = :un WHERE id = :id")->execute([
            'un' => $username,
            'id' => $user['id']
        ]);
        echo "Usuario ID {$user['id']} actualizado con username: $username\n";
    }

    // 3. Set a default for the admin if email is admin@tucooperativa.com
    $db->exec("UPDATE usuarios SET username = 'admin' WHERE email = 'admin@tucooperativa.com'");
    
} catch (Exception $e) {
    echo "ERROR O COLUMNA YA EXISTE: " . $e->getMessage() . "\n";
}
