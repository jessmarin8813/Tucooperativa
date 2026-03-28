<?php
try {
    $db = new PDO('mysql:host=localhost;dbname=tu_cooperativa', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $query = "ALTER TABLE vehiculos ADD COLUMN status_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP";
    $db->exec($query);
    echo "OK: status_changed_at added to vehiculos\n";
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "OK: Column already exists\n";
    } else {
        echo "ERROR: " . $e->getMessage() . "\n";
    }
}
