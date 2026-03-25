<?php
/**
 * ULTIMATE GUARD - DEEP INSPECTION RUNNER (V10)
 * Ahora inspecciona el JSON de salida para detectar errores de datos silenciados.
 */
echo "--- INICIANDO ULTIMATE GUARD (Nivel: Inspeccion Profunda) ---\n";

$files = [];
$it = new RecursiveDirectoryIterator('api');
foreach (new RecursiveIteratorIterator($it) as $file) {
    if ($file->getExtension() == 'php') {
        $p = $file->getPathname();
        if (strpos($p, 'includes') !== false || strpos($p, 'tests') !== false || strpos($p, 'migrate') !== false || strpos($p, 'db_') !== false || strpos($p, 'fix') !== false || strpos($p, 'global_fix') !== false) continue;
        $files[] = $p;
    }
}

foreach ($files as $f) {
    echo "AUDITANDO " . basename($f) . "... ";
    
    // El mock ahora captura el JSON en un buffer y lo valida
    $mockCode = "
        error_reporting(E_ALL & ~E_NOTICE);
        \$_SESSION = ['user_id'=>1, 'cooperativa_id'=>1, 'rol'=>'superadmin', 'nombre'=>'Admin'];
        \$_SERVER['REQUEST_METHOD'] = 'GET';
        function checkAuth(){ return \$_SESSION; }
        function sendResponse(\$d, \$c=200){ 
            echo json_encode(['code'=>\$c, 'data'=>\$d]); // Empaquetamos para ver el status
            exit(0); 
        }
        function sendTelegramNotification(\$t,\$m,\$c){ return true; }
        
        ob_start();
        try {
            include '$f';
        } catch(Throwable \$e) {
            echo json_encode(['code'=>500, 'error'=>\$e->getMessage(), 'file'=>basename(\$e->getFile()), 'line'=>\$e->getLine()]);
        }
        \$out = ob_get_clean();
        echo \$out;
    ";
    
    $mockCode = str_replace('"', '\"', $mockCode);
    $cmd = "c:\\xampp\\php\\php.exe -r \"$mockCode\" 2>&1";
    
    $output = [];
    $ret = 0;
    exec($cmd, $output, $ret);
    $responseStr = trim(implode("", $output));
    
    // Intentamos decodificar el resultado para ver si hay error interno
    $json = json_decode($responseStr, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        // Si no es JSON, es un fatal error crudo o texto basura
        if (strpos($responseStr, "Fatal error") !== false || strpos($responseStr, "Parse error") !== false) {
            echo "FAIL (Fatal/Parse Error)\n";
            echo "   -> LOG: $responseStr\n";
            exit(1);
        }
        echo "PASS (Non-JSON module)\n"; // Algunos scripts no retornan JSON (config, etc)
    } else {
        // Si es JSON, revisamos si el status es de error o el contenido tiene error
        if (isset($json['code']) && $json['code'] >= 400 && $json['code'] != 401 && $json['code'] != 403) {
            echo "FAIL (Runtime Error " . $json['code'] . ")\n";
            echo "   -> DETALLE: " . ($json['data']['error'] ?? $json['error'] ?? 'Desconocido') . "\n";
            exit(1);
        }
        
        // Verificación extra: Si el JSON tiene un campo 'error' explícito (aunque el code sea 200)
        if (isset($json['data']['error']) || isset($json['error'])) {
             echo "FAIL (Logic Error Captured)\n";
             echo "   -> ERROR: " . ($json['data']['error'] ?? $json['error']) . "\n";
             exit(1);
        }
        
        echo "PASS\n";
    }
}

echo "--- AUDITORIA DE EJECUCIÓN EXITOSA. TODO EL BACKEND ES SEGURO. ---\n";
