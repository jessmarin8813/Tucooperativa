<?php
/**
 * Driver Management API (TuCooperativa)
 */
require_once '../includes/db.php';
require_once '../includes/middleware.php';

$auth = checkAuth();
$db = DB::getInstance();

// Scoped query for security
function getScopedChoferes($db, $coop_id) {
    $stmt = $db->prepare("SELECT id, nombre, cedula, email, telegram_id, created_at 
                          FROM usuarios 
                          WHERE cooperativa_id = ? AND rol = 'chofer'
                          ORDER BY created_at DESC");
    $stmt->execute([$coop_id]);
    return $stmt->fetchAll();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $choferes = getScopedChoferes($db, $auth['cooperativa_id']);
    
    // Enrich with current activity (linked to current active routes)
    foreach ($choferes as &$chofer) {
        $stmt_ruta = $db->prepare("SELECT COUNT(*) as active FROM rutas WHERE chofer_id = ? AND estado = 'activa'");
        $stmt_ruta->execute([$chofer['id']]);
        $chofer['is_online'] = $stmt_ruta->fetch()['active'] > 0;
    }
    
    sendResponse($choferes);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete/Suspend logic
    $id = $_GET['id'] ?? null;
    if (!$id) sendResponse(['error' => 'Missing ID'], 400);
    
    $stmt = $db->prepare("DELETE FROM usuarios WHERE id = ? AND cooperativa_id = ? AND rol = 'chofer'");
    $stmt->execute([$id, $auth['cooperativa_id']]);
    
    sendResponse(['status' => 'success']);
}
