<?php
/**
 * Driver Management API (TuCooperativa) - Refactored for Dedicated Table
 */
require_once '../includes/db.php';
require_once '../includes/middleware.php';

$auth = checkAuth();
$db = DB::getInstance();

// Scoped query for security - Now from 'choferes' table
function getScopedChoferes($db, $coop_id) {
    $stmt = $db->prepare("SELECT id, nombre, cedula, telegram_id, created_at 
                          FROM choferes 
                          WHERE cooperativa_id = ? 
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
        $chofer['is_online'] = ($stmt_ruta->fetch()['active'] ?? 0) > 0;
    }
    
    sendResponse($choferes);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete/Suspend logic
    $id = $_GET['id'] ?? null;
    if (!$id) sendResponse(['error' => 'Missing ID'], 400);
    
    // Check if the driver has active routes before deleting
    $stmt_check = $db->prepare("SELECT COUNT(*) FROM rutas WHERE chofer_id = ? AND estado = 'activa'");
    $stmt_check->execute([$id]);
    if ($stmt_check->fetchColumn() > 0) {
        sendResponse(['error' => 'No se puede eliminar un chofer con ruta activa'], 400);
    }
    
    $stmt = $db->prepare("DELETE FROM choferes WHERE id = ? AND cooperativa_id = ?");
    $stmt->execute([$id, $auth['cooperativa_id']]);
    
    sendResponse(['status' => 'success']);
}
?>
