<?php
require_once __DIR__ . '/../includes/db.php';
$db = DB::getInstance();

try {
    echo "REPARANDO PAGOS_REPORTADOS...\n";
    // Check if id_ruta exists
    $stmt = $db->query("DESCRIBE pagos_reportados");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('id_ruta', $cols)) {
        echo "Añadiendo id_ruta...\n";
        $db->exec("ALTER TABLE pagos_reportados ADD COLUMN id_ruta INT(11) AFTER chofer_id");
        $db->exec("UPDATE pagos_reportados SET id_ruta = 1 WHERE id_ruta IS NULL"); // Dummy data to avoid join failure
    } else {
        echo "id_ruta ya existe.\n";
    }

    echo "REPARANDO RUTAS (combustible)...\n";
    $stmt2 = $db->query("DESCRIBE rutas");
    $cols2 = $stmt2->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('combustible', $cols2)) {
        echo "Añadiendo combustible...\n";
        $db->exec("ALTER TABLE rutas ADD COLUMN combustible FLOAT DEFAULT 0 AFTER ended_at");
    }

    echo "REPARANDO COOPERATIVAS (banco)...\n";
    $stmt3 = $db->query("DESCRIBE cooperativas");
    $cols3 = $stmt3->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('banco_nombre', $cols3)) {
        echo "Añadiendo columnas de banco...\n";
        $db->exec("ALTER TABLE cooperativas ADD COLUMN banco_nombre VARCHAR(100), ADD COLUMN banco_tipo VARCHAR(50), ADD COLUMN banco_numero VARCHAR(50), ADD COLUMN banco_identificacion VARCHAR(50), ADD COLUMN banco_telefono VARCHAR(50)");
    }

    echo "SUCCESS\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
