<?php
/**
 * Vehicle Update/Edit API (Admin/Owner only)
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();

// Security: Only Admin, Owner, or Superadmin
if ($user['rol'] !== 'dueno' && $user['rol'] !== 'superadmin') {
    sendResponse(['error' => 'Permission denied'], 403);
}

$data = json_decode(file_get_contents('php://input'), true);
error_log("VEHICLE_API_REQUEST: " . json_encode($data));
error_log("USER_COOP_ID: " . ($user['cooperativa_id'] ?? 'NULL'));

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

    } elseif ($action === 'delete') {
        // Limpieza Radiactiva (v52.2)
        $coop_id = $user['cooperativa_id'];
        
        try {
            $db->beginTransaction();
            $db->exec("SET FOREIGN_KEY_CHECKS = 0");
            
            // 1. Borrar toda la actividad de la unidad
            $tables = ['gastos', 'incidencias', 'rutas', 'odometros', 'invitaciones', 'cargas_combustible'];
            foreach ($tables as $table) {
                try {
                    $db->prepare("DELETE FROM $table WHERE vehiculo_id = ?")->execute([$id]);
                } catch (Exception $e) {} // Ignorar si no existe la tabla
            }
            
            // 2. Limpiar asociación en pagos diarios
            try { $db->prepare("DELETE FROM pagos_diarios WHERE vehiculo_id = ?")->execute([$id]); } catch (Exception $e) {}
            
            // 3. Borrar físicamente el vehículo
            $stmt = $db->prepare("DELETE FROM vehiculos WHERE id = ? AND cooperativa_id = ?");
            $stmt->execute([$id, $coop_id]);
            
            $db->exec("SET FOREIGN_KEY_CHECKS = 1");
            $db->commit();

            // Real-time Event (Multi-hub)
            if (function_exists('broadcastRealtime')) {
                broadcastRealtime('UPDATE_FLEET', ['cooperativa_id' => $coop_id]);
            }

            sendResponse(['success' => true, 'message' => 'Unidad eliminada del sistema.']);

        } catch (Exception $e) {
            if ($db->inTransaction()) {
                $db->exec("SET FOREIGN_KEY_CHECKS = 1");
                $db->rollBack();
            }
            sendResponse(['error' => 'Critical error', 'message' => $e->getMessage()], 500);
        }

    } else {
        sendResponse(['error' => 'Unsupported action'], 400);
    }
} catch (PDOException $e) {
    sendResponse(['error' => 'Database error', 'msg' => $e->getMessage()], 500);
}
