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

        // 2. Registrar Chofer (Campos mínimos requeridos por schema.sql)
        // Usamos telegram_id como base para el email único (requerido por NOT NULL)
        $dummy_email = $telegram_id . "@tucooperativa.bot";
        $dummy_pass = password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT);

        // Solo insertamos los campos confirmados en schema.sql más los de telegram
        $stmt = $db->prepare("INSERT INTO usuarios (cooperativa_id, nombre, email, password_hash, telegram_id, rol) VALUES (?, ?, ?, ?, ?, 'chofer')");
        $stmt->execute([$invitacion['cooperativa_id'], $nombre, $dummy_email, $dummy_pass, $telegram_id]);
        $chofer_id = $db->lastInsertId();

        // 2b. Auto-vincular a Unidad si aplica
        if (!empty($invitacion['vehiculo_id'])) {
            $stmt = $db->prepare("UPDATE vehiculos SET chofer_id = ? WHERE id = ? AND cooperativa_id = ?");
            $stmt->execute([$chofer_id, $invitacion['vehiculo_id'], $invitacion['cooperativa_id']]);
        }

        // 3. Marcar Token como usado
        $stmt = $db->prepare("UPDATE invitaciones SET usado = TRUE WHERE token = ?");
        $stmt->execute([$token]);

        echo json_encode(['status' => 'success', 'message' => 'Registro de chofer completado']);

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
