<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();

try {
    $db->exec("CREATE TABLE IF NOT EXISTS gastos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cooperativa_id INT NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        descripcion VARCHAR(255),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "TABLA gastos CREADA.\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
