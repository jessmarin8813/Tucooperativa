<?php
/**
 * Migration: Add pago_info to usuarios
 */
require_once __DIR__ . '/api/includes/db.php';
$db = DB::getInstance();

try {
    $db->exec("ALTER TABLE usuarios ADD COLUMN pago_info TEXT NULL AFTER telegram_id");
    echo "COLUMNA pago_info AÑADIDA CORRECTAMENTE.\n";
    
    // Seed some data for the current admin/owner if exists
    $db->exec("UPDATE usuarios SET pago_info = 'BNC - Pago Móvil: 0412-1234567 - V-12345678' WHERE rol IN ('admin', 'dueno') LIMIT 1");
    echo "DATOS DE EJEMPLO INSERTADOS.\n";
} catch (Exception $e) {
    echo "ERROR O COLUMNA YA EXISTE: " . $e->getMessage() . "\n";
}
