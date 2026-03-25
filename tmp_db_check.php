<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=tu_cooperativa', 'root', '');
    $stmt = $pdo->query("SHOW COLUMNS FROM pagos_diarios");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo $row['Field'] . ': ' . $row['Type'] . PHP_EOL;
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
