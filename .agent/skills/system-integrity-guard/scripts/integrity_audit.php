<?php
/**
 * System Integrity Audit v1.0
 * Path: .agent/skills/system-integrity-guard/scripts/integrity_audit.php
 */
require_once __DIR__ . '/../../../../api/includes/db.php';

header('Content-Type: application/json');
$report = [
    'timestamp' => date('Y-m-d H:i:s'),
    'status' => 'PASS',
    'checks' => []
];

function check($name, $condition, $error_msg) {
    global $report;
    try {
        $passed = $condition();
    } catch (Exception $e) {
        $passed = false;
        $error_msg .= " (Exception: " . $e->getMessage() . ")";
    }
    $report['checks'][] = [
        'name' => $name,
        'status' => $passed ? 'PASS' : 'FAIL',
        'message' => $passed ? 'OK' : $error_msg
    ];
    if (!$passed) $report['status'] = 'FAIL';
}

// 1. Check DB Schema
check("DB: Cooperativas Banco Columns", function() {
    $db = DB::getInstance();
    $cols = $db->query("DESCRIBE cooperativas")->fetchAll(PDO::FETCH_COLUMN);
    return in_array('banco_nombre', $cols) && in_array('banco_telefono', $cols);
}, "Faltan columnas de banco en la tabla cooperativas.");

check("DB: Rutas Combustible Column", function() {
    $db = DB::getInstance();
    $cols = $db->query("DESCRIBE rutas")->fetchAll(PDO::FETCH_COLUMN);
    return in_array('combustible', $cols);
}, "La tabla rutas usa nombres antiguos (combustible_reportado?). Debe ser 'combustible'.");

// 2. Check Routing
check("Routing: Root .htaccess Persistence", function() {
    $content = file_get_contents(__DIR__ . '/../../../../.htaccess');
    return strpos($content, '[R,L,QSA]') !== false;
}, "El .htaccess raíz no tiene la bandera QSA. El refresco de página (F5) fallará.");

// 3. Check App.jsx Views
check("Frontend: View-Whitelist Integrity", function() {
    $content = file_get_contents(__DIR__ . '/../../../../client/src/App.jsx');
    return strpos($content, "'forensic'") !== false;
}, "La vista 'forensic' no está registrada en App.jsx. El refresco de página fallará en el Bunker.");

// 4. Check Filesystem & Permissions
check("FS: Notification Cache Directory", function() {
    $path = __DIR__ . '/../../../../api/system/tmp/ratelimit';
    return is_dir($path) && is_writable($path);
}, "El directorio de caché api/system/tmp/ratelimit no existe o no tiene permisos de escritura.");

// 5. Check Middleware Stability
check("Middleware: Relaxed Error Handler", function() {
    $content = file_get_contents(__DIR__ . '/../../../../api/includes/middleware.php');
    return strpos($content, "// throw new ErrorException") !== false;
}, "El middleware estricto está activo. Cualquier Warning bloqueará el sistema con un Error 500.");

echo json_encode($report, JSON_PRETTY_PRINT);

if ($report['status'] === 'FAIL') exit(1);
?>
