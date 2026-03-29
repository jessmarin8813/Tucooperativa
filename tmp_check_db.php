<?php
require_once 'api/includes/middleware.php';
$db = DB::getInstance();
try {
    $stmt = $db->query("SHOW TABLES LIKE 'mantenimiento_catalogo'");
    $res = $stmt->fetchAll();
    if (empty($res)) {
        echo "TABLE_MISSING";
    } else {
        echo "TABLE_FOUND";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
