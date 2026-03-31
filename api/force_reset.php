<?php
/**
 * FORCE REINIT (v51.0-Forense)
 */
require_once __DIR__ . '/includes/DB.php';

try {
    $db = DB::getInstance();
    $db->exec("DELETE FROM gastos");
    $db->exec("DELETE FROM incidencias");
    $db->exec("UPDATE vehiculos SET estado = 'activo', status_changed_at = NOW()");
    
    echo json_encode([
        'status' => 'SUCCESS',
        'message' => 'Base de datos reseteada. BI=$0, Fallas=0',
        'timestamp' => date('H:i:s')
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'ERROR',
        'message' => $e->getMessage()
    ]);
}
