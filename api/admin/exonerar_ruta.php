<?php
/**
 * API: Exonerar Ruta (Ajuste Gerencial)
 * Path: api/admin/exonerar_ruta.php
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
if (!in_array($user['rol'], ['admin', 'dueno', 'owner'])) {
    sendResponse(['error' => 'No autorizado'], 403);
}

$db = DB::getInstance();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $ruta_id = $data['ruta_id'] ?? null;

    if (!$ruta_id) {
        sendResponse(['error' => 'Ruta ID requerido'], 400);
    }

    // 1. Validar que la ruta pertenece a su cooperativa
    $stmt = $db->prepare("UPDATE rutas SET estado = 'exonerada', observacion = CONCAT(COALESCE(observacion,''), ' | EXONERADA POR DUEÑO') 
                          WHERE id = ? AND cooperativa_id = ?");
    $stmt->execute([$ruta_id, $user['cooperativa_id']]);

    if ($stmt->rowCount() > 0) {
        sendResponse(['success' => true, 'message' => 'Ruta exonerada. El cobro de este día ha sido anulado.']);
    } else {
        sendResponse(['error' => 'No se encontró la ruta o no tienes permisos.'], 404);
    }
}
