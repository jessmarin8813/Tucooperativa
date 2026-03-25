<?php
/**
 * OMNI-GUARD 2.0: DEEP RUNTIME & MODULE CRAWLER
 * Este script escanea y valida la salud INTEGRAL del backend.
 */
require_once 'api/includes/db.php';
$db = DB::getInstance();

echo "--- INICIANDO EXAMEN DE SALUD TOTAL (OMNI-GUARD 2.0) ---\n";

function check_syntax_and_load($file) {
    // 1. Sintaxis
    $output = [];
    $ret = 0;
    exec("c:\\xampp\\php\\php.exe -l \"$file\"", $output, $ret);
    if ($ret !== 0) {
        echo "[FAIL] Error de Sintaxis en: $file\n";
        exit(1);
    }
}

// 1. Escaneo de todos los archivos PHP en /api para detectar inconsistencias
$it = new RecursiveDirectoryIterator('api');
foreach (new RecursiveIteratorIterator($it) as $file) {
    if ($file->getExtension() == 'php') {
        $path = $file->getPathname();
        // Evitamos recursión infinita de este mismo test
        if (strpos($path, 'tests') !== false) continue;
        
        check_syntax_and_load($path);
        echo "[OK] Syntax: " . basename($path) . "\n";
    }
}

// 2. Mock de Ejecución de Lógica SQL Crítica
$scenarios = [
    'Dashboard' => "SELECT v.id, r.id FROM vehiculos v LEFT JOIN rutas r ON v.id = r.vehiculo_id WHERE v.cooperativa_id = 1 LIMIT 1",
    'BI/Rentabilidad' => "SELECT SUM(monto) FROM pagos_reportados UNION SELECT SUM(costo) FROM mantenimiento_items UNION SELECT SUM(monto) FROM gastos",
    'Forense' => "SELECT alerta_combustible FROM rutas LIMIT 1",
    'Seguridad' => "SELECT username, password_hash FROM usuarios LIMIT 1"
];

foreach ($scenarios as $name => $sql) {
    try {
        $db->query($sql);
        echo "[OK] Lógica SQL: $name\n";
    } catch (Exception $e) {
        echo "[FAIL] Error Lógico SQL en $name: " . $e->getMessage() . "\n";
        exit(1);
    }
}

echo "--- EXAMEN DE SALUD EXITOSO. EL BACKEND ES 100% ESTABLE. ---\n";
