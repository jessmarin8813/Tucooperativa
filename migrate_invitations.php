<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=tu_cooperativa', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("SHOW COLUMNS FROM invitaciones");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (!in_array('vehiculo_id', $columns)) {
        echo "Adding vehiculo_id to invitaciones..." . PHP_EOL;
        $pdo->exec("ALTER TABLE invitaciones ADD COLUMN vehiculo_id INT DEFAULT NULL AFTER cooperativa_id");
    }

    echo "SUCCESS: Migration completed." . PHP_EOL;
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . PHP_EOL;
}
