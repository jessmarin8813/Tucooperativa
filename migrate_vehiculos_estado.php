<?php
/**
 * Migration: Add estado to vehiculos
 */
require_once __DIR__ . '/api/includes/db.php';
$db = DB::getInstance();

try {
    $db->exec("ALTER TABLE vehiculos ADD COLUMN estado ENUM('activo', 'inactivo', 'mantenimiento') DEFAULT 'activo' AFTER placa");
    echo "COLUMNA estado AÑADIDA A vehiculos CORRECTAMENTE.\n";
} catch (Exception $e) {
    echo "ERROR O COLUMNA YA EXISTE: " . $e->getMessage() . "\n";
}
