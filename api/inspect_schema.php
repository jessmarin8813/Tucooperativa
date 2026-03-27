<?php
require_once 'includes/db.php';
header('Content-Type: application/json');
try {
    $db = DB::getInstance();
    $tables = ['usuarios', 'invitaciones', 'cooperativas', 'vehiculos'];
    $schema = [];
    foreach ($tables as $table) {
        try {
            $schema[$table] = $db->query("DESCRIBE $table")->fetchAll();
        } catch (Exception $e) {
            $schema[$table] = "Error: " . $e->getMessage();
        }
    }
    echo json_encode($schema);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
