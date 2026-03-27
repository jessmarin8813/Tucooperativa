<?php
require_once __DIR__ . '/api/includes/db.php';

$db = DB::getInstance();
$tables = ['rutas', 'pagos_reportados', 'vehiculos'];

foreach ($tables as $table) {
    echo "\n--- Esquema de la tabla: $table ---\n";
    try {
        $stmt = $db->query("DESCRIBE $table");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "{$row['Field']} - {$row['Type']} - {$row['Null']} - {$row['Key']}\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>
