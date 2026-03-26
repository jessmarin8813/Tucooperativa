<?php
/**
 * Seed Script (For Test Only)
 */
require_once __DIR__ . '/api/includes/db.php';

$db = DB::getInstance();

try {
    // 1. Create a Cooperative
    $db->exec("INSERT IGNORE INTO cooperativas (id, nombre, rif) VALUES (1, 'TransMonagas Cooperativa', 'J-12345678-9')");
    
    // 2. Create an Owner User
    $pass = password_hash('password123', PASSWORD_DEFAULT);
    $db->exec("INSERT IGNORE INTO usuarios (id, cooperativa_id, nombre, email, password_hash, rol) 
               VALUES (1, 1, 'Jesus Marin (DUEÑO)', 'admin@tucooperativa.com', '$pass', 'dueno')");
    
    // 3. Create a Driver User
    $db->exec("INSERT IGNORE INTO usuarios (id, cooperativa_id, nombre, email, password_hash, rol, telegram_id) 
               VALUES (2, 1, 'Chofer Test', 'chofer@tucooperativa.com', '$pass', 'chofer', 12345678)");

    echo "Seed successful. Use admin@tucooperativa.com / password123 to login.\n";
} catch (Exception $e) {
    echo "Seed failed: " . $e->getMessage();
}
