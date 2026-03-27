<?php
require_once __DIR__ . '/api/includes/db.php';
$db = DB::getInstance();
$tables = ['mantenimiento_items', 'gastos'];
foreach ($tables as $table) {
    echo "\n--- $table ---\n";
    try {
        $stmt = $db->query("DESCRIBE $table");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "{$row['Field']} - {$row['Type']}\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>
