<?php
/**
 * Database Schema Doctor - Antigravity Skill
 * Conecta a la base de datos activa y extrae la estructura completa.
 */
header('Content-Type: application/json');

// Requerir la conexión real del proyecto para que sea 100% adaptable
$root_path = dirname(__DIR__, 4); // Sube 4 niveles desde .agent/skills/database/scripts
if (file_exists($root_path . '/api/db.php')) {
    require_once $root_path . '/api/db.php';
} else {
    // Fallback if running from a different directory
    require_once '../../../api/db.php'; 
}

try {
    $pdo = getDBConnection();
    
    // Obtener nombre de la DB para el reporte
    $dbName = $pdo->query('select database()')->fetchColumn();

    $tablesQuery = $pdo->query("SHOW TABLES");
    $tables = $tablesQuery->fetchAll(PDO::FETCH_COLUMN);
    
    $schema = [];

    foreach ($tables as $table) {
        $colsQuery = $pdo->query("DESCRIBE `$table`");
        $columns = $colsQuery->fetchAll(PDO::FETCH_ASSOC);
        
        $colDetails = [];
        foreach ($columns as $col) {
            $colDetails[] = [
                'field' => $col['Field'],
                'type' => $col['Type'],
                'null' => $col['Null'],
                'key' => $col['Key'],
                'default' => $col['Default']
            ];
        }
        $schema[$table] = $colDetails;
    }

    $report = [
        'status' => 'success',
        'database' => $dbName,
        'table_count' => count($tables),
        'schema' => $schema
    ];

    echo json_encode($report, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
