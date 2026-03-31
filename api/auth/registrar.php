<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/middleware.php';
require_once __DIR__ . '/../includes/realtime.php';
// Registro vía Deep Link
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $token = $data['token'] ?? '';
    $telegram_id = $data['telegram_id'] ?? '';
    $nombre = $data['nombre'] ?? 'Chofer';

    if (!$token || !$telegram_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Token and Telegram ID required']);
        exit;
    }

    header('Content-Type: application/json');
    // Silenciar errores PHP pero capturar excepciones PDO para reporte JSON limpio
    error_reporting(0);

    try {
        $db = DB::getInstance();
        $action = $data['action'] ?? 'register_driver';

        if ($action === 'link_owner') {
            // 1. Validar Token de Dueño
            $stmt = $db->prepare("SELECT id, cooperativa_id, rol FROM usuarios WHERE telegram_link_token = ? AND telegram_link_token IS NOT NULL");
            $stmt->execute([$token]);
            $user = $stmt->fetch();

            if (!$user) {
                http_response_code(404);
                echo json_encode(['error' => 'Token de vínculo inválido o expirado', 'message' => 'Token de vínculo inválido']);
                exit;
            }

            // 2. Vincular Telegram en Usuario
            $stmt = $db->prepare("UPDATE usuarios SET telegram_id = ?, telegram_link_token = NULL WHERE id = ?");
            $stmt->execute([$telegram_id, $user['id']]);

            // 3. Si es Dueño/Admin, actualizar también la configuración de la Cooperativa
            if ($user['rol'] === 'dueno') {
                $stmt = $db->prepare("UPDATE cooperativas SET telegram_chat_id = ? WHERE id = ?");
                $stmt->execute([$telegram_id, $user['cooperativa_id']]);
            }

            echo json_encode(['status' => 'success', 'message' => '¡Dueño vinculado con éxito!']);
            exit;
        }

        // 1. Validar Token de Invitación (Chofer)
        $stmt = $db->prepare("SELECT i.*, v.placa as vehiculo_placa, v.modelo as vehiculo_modelo 
                             FROM invitaciones i 
                             LEFT JOIN vehiculos v ON i.vehiculo_id = v.id
                             WHERE i.token = ? AND i.usado = FALSE");
        $stmt->execute([$token]);
        $invitacion = $stmt->fetch();

        if (!$invitacion) {
            http_response_code(404);
            echo json_encode(['error' => 'Token de invitación inválido o ya usado', 'message' => 'Token inválido']);
            exit;
        }

        $nombre = $data['nombre'] ?? 'Chofer';
        $cedula = $data['cedula'] ?? '';

        $db->beginTransaction();
        
        // 2. Registrar Chofer en la nueva tabla dedicada
        // Ya no requerimos email ni password para conductores, se manejan vía Telegram ID
        $stmt = $db->prepare("INSERT INTO choferes (cooperativa_id, nombre, cedula, telegram_id) VALUES (?, ?, ?, ?)");
        $stmt->execute([$invitacion['cooperativa_id'], $nombre, $cedula, $telegram_id]);
        $chofer_id = $db->lastInsertId();

        // 2b. Vinculación automática si la invitación tenía vehiculo_id
        if (!empty($invitacion['vehiculo_id'])) {
            $stmt = $db->prepare("UPDATE vehiculos SET chofer_id = ? WHERE id = ?");
            $stmt->execute([$chofer_id, $invitacion['vehiculo_id']]);
        }
        
        // 3. Marcar Token como usado
        $stmt = $db->prepare("UPDATE invitaciones SET usado = TRUE WHERE token = ?");
        $stmt->execute([$token]);

        $db->commit();
        
        // Broadcast Realtime Update to UI
        broadcastRealtime('UPDATE_FLEET', ['message' => 'Nuevo chofer vinculado', 'cooperativa_id' => $invitacion['cooperativa_id']]);
        broadcastRealtime('REFRESH_AUTH'); // Trigger auth refresh if needed

        echo json_encode([
            'status' => 'success', 
            'message' => 'Registro de chofer completado', 
            'chofer_id' => $chofer_id,
            'cooperativa_id' => $invitacion['cooperativa_id'],
            'vehiculo_id' => $invitacion['vehiculo_id'] ?? null,
            'vehiculo_placa' => $invitacion['vehiculo_placa'] ?? null
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        // Reportar el error real para diagnóstico, pero en formato JSON
        echo json_encode([
            'status' => 'error',
            'error' => 'Error de servidor: ' . $e->getMessage(),
            'message' => 'Fallo en la operación de base de datos'
        ]);
        exit;
    }
}
