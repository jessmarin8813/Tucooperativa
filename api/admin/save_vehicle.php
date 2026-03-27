<?php
/**
 * Vehicle Update/Edit API (Admin/Owner only)
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();

// Security: Only Admin or the Owner of the unit (implicit by coop_id check)
if ($user['rol'] !== 'admin' && $user['rol'] !== 'dueno') {
    sendResponse(['error' => 'Permission denied'], 403);
}

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? null;
$action = $data['action'] ?? 'edit';

if (!$id) {
    sendResponse(['error' => 'Missing vehicle ID'], 400);
}

try {
    if ($action === 'edit') {
        // We only allow updating chofer_id and basic info via this specific endpoint for now
        $chofer_id = isset($data['chofer_id']) ? $data['chofer_id'] : null;
        
        // Handle Unlink (0 or null)
        $target_chofer = ($chofer_id === 0 || $chofer_id === null) ? null : $chofer_id;

        $stmt = $db->prepare("UPDATE vehiculos 
                             SET chofer_id = :chofer_id 
                             WHERE id = :id AND cooperativa_id = :coop_id");
                             
        $stmt->execute([
            'chofer_id' => $target_chofer,
            'id' => $id,
            'coop_id' => $user['cooperativa_id']
        ]);

        // Real-time Event
        if (class_exists('RealtimeHub')) {
            RealtimeHub::dispatch('UPDATE_FLEET', ['vehicle_id' => $id]);
        }

        sendResponse(['success' => true, 'message' => 'Vehículo actualizado correctamente']);
    } else {
        sendResponse(['error' => 'Unsupported action'], 400);
    }
} catch (PDOException $e) {
    sendResponse(['error' => 'Database error', 'msg' => $e->getMessage()], 500);
}
?>
