<?php
require_once '../includes/db.php';

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
            if ($user['rol'] === 'dueno' || $user['rol'] === 'admin') {
                $stmt = $db->prepare("UPDATE cooperativas SET telegram_chat_id = ? WHERE id = ?");
                $stmt->execute([$telegram_id, $user['cooperativa_id']]);
            }

            echo json_encode(['status' => 'success', 'message' => '¡Dueño vinculado con éxito!']);
            exit;
        }

        // 1. Validar Token de Invitación (Chofer)
        $stmt = $db->prepare("SELECT * FROM invitaciones WHERE token = ? AND usado = FALSE");
        $stmt->execute([$token]);
        $invitacion = $stmt->fetch();

        if (!$invitacion) {
            http_response_code(404);
            echo json_encode(['error' => 'Token de invitación inválido o ya usado', 'message' => 'Token inválido']);
            exit;
        }

        $nombre = $data['nombre'] ?? 'Chofer';
        $cedula = $data['cedula'] ?? '';

        // 2. Registrar Chofer en la nueva tabla dedicada
        // Ya no requerimos email ni password para conductores, se manejan vía Telegram ID
        $stmt = $db->prepare("INSERT INTO choferes (cooperativa_id, nombre, cedula, telegram_id) VALUES (?, ?, ?, ?)");
        $stmt->execute([$invitacion['cooperativa_id'], $nombre, $cedula, $telegram_id]);
        $chofer_id = $db->lastInsertId();

        // 2b. La vinculación a unidad se maneja mediante el inicio de rutas
        // Nota: Si se requiere vinculación permanente, considerar añadir chofer_id a la tabla vehiculos
        
        // 3. Marcar Token como usado
        $stmt = $db->prepare("UPDATE invitaciones SET usado = TRUE WHERE token = ?");
        $stmt->execute([$token]);

        echo json_encode(['status' => 'success', 'message' => 'Registro de chofer completado', 'chofer_id' => $chofer_id]);

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
?>
