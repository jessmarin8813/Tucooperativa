<?php
/**
 * CORE INTEGRITY LOGIC
 * Can be included by CLI or WEB
 */

// 1. Check DB Structure
check("DB: Cooperativas Banco Columns", function() {
    global $db;
    if (!isset($db)) {
        require_once __DIR__ . '/../../../api/includes/db.php';
        $db = DB::getInstance();
    }
    $stmt = $db->query("DESCRIBE cooperativas");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    return in_array('banco_nombre', $cols) && in_array('cuota_diaria', $cols);
}, "Columnas de banco o cuota_diaria faltan en la tabla cooperativas.");

check("DB: Rutas Combustible Column", function() {
    global $db;
    $stmt = $db->query("DESCRIBE rutas");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    return in_array('combustible', $cols);
}, "Falta la columna 'combustible' en la tabla rutas.");

check("DB: Pagos Reportados id_ruta", function() {
    global $db;
    $stmt = $db->query("DESCRIBE pagos_reportados");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    return in_array('id_ruta', $cols);
}, "Falta la columna 'id_ruta' en la tabla pagos_reportados.");

// 2. Check Routing
check("Routing: Root .htaccess Persistence", function() {
    $path = __DIR__ . '/../../../../.htaccess';
    if (!file_exists($path)) return false;
    $content = file_get_contents($path);
    return strpos($content, '[R,L,QSA]') !== false;
}, "El .htaccess raíz no tiene la bandera QSA.");

// 3. Check Filesystem
check("FS: Cache Writable", function() {
    $path = __DIR__ . '/../../../../api/system/tmp/ratelimit';
    return is_dir($path) && is_writable($path);
}, "El directorio de caché no es escribible.");
?>
