<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=tu_cooperativa', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Creating invitaciones table..." . PHP_EOL;
    $pdo->exec("CREATE TABLE IF NOT EXISTS invitaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cooperativa_id INT NOT NULL,
        vehiculo_id INT DEFAULT NULL,
        token VARCHAR(100) NOT NULL UNIQUE,
        usado BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id),
        FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
    )");

    echo "SUCCESS: Table created." . PHP_EOL;
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . PHP_EOL;
}
