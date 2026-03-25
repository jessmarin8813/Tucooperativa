<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=tu_cooperativa', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Updating status column..." . PHP_EOL;
    $pdo->exec("ALTER TABLE pagos_diarios MODIFY COLUMN estado ENUM('pendiente', 'pagado', 'validado', 'rechazado') DEFAULT 'pendiente'");

    echo "Checking for missing amount columns..." . PHP_EOL;
    $stmt = $pdo->query("SHOW COLUMNS FROM pagos_diarios");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (!in_array('monto_efectivo', $columns)) {
        echo "Adding monto_efectivo..." . PHP_EOL;
        $pdo->exec("ALTER TABLE pagos_diarios ADD COLUMN monto_efectivo DECIMAL(10,2) DEFAULT 0.00 AFTER monto");
    }
    if (!in_array('monto_pagomovil', $columns)) {
        echo "Adding monto_pagomovil..." . PHP_EOL;
        $pdo->exec("ALTER TABLE pagos_diarios ADD COLUMN monto_pagomovil DECIMAL(10,2) DEFAULT 0.00 AFTER monto_efectivo");
    }

    echo "SUCCESS: Migration completed." . PHP_EOL;
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . PHP_EOL;
}
