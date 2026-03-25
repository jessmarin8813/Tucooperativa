<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();

$output = "";
function audit($table) {
    global $db, $output;
    $output .= "TABLE: $table\n";
    try {
        $cols = $db->query("DESCRIBE $table")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($cols as $c) {
            $output .= " - {$c['Field']} ({$c['Type']})\n";
        }
    } catch (Exception $e) { $output .= " ERROR: " . $e->getMessage() . "\n"; }
    $output .= "\n";
}
audit('usuarios');
audit('vehiculos');
audit('rutas');
audit('pagos_reportados');
file_put_contents('db_audit_result.txt', $output);
