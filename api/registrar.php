<?php
require_once 'includes/db.php';

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

    $db = DB::getInstance();
    $action = $data['action'] ?? 'register_driver';

    if ($action === 'link_owner') {
        // 1. Validar Token de Dueño
        $stmt = $db->prepare("SELECT id FROM usuarios WHERE telegram_link_token = ? AND telegram_link_token IS NOT NULL");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Token de vínculo inválido o expirado']);
            exit;
        }

        // 2. Vincular Telegram
        $stmt = $db->prepare("UPDATE usuarios SET telegram_chat_id = ?, telegram_link_token = NULL WHERE id = ?");
        $stmt->execute([$telegram_id, $user['id']]);

        echo json_encode(['status' => 'success', 'message' => '¡Dueño vinculado con éxito!']);
        exit;
    }

    // 1. Validar Token de Invitación (Chofer)
    $stmt = $db->prepare("SELECT * FROM invitaciones WHERE token = ? AND usado = FALSE");
    $stmt->execute([$token]);
    $invitacion = $stmt->fetch();

    if (!$invitacion) {
        http_response_code(404);
        echo json_encode(['error' => 'Token de invitación inválido o ya usado']);
        exit;
    }

    // 2. Registrar Chofer
    $stmt = $db->prepare("INSERT INTO usuarios (cooperativa_id, nombre, telegram_chat_id, rol) VALUES (?, ?, ?, 'chofer')");
    $stmt->execute([$invitacion['cooperativa_id'], $nombre, $telegram_id]);
    $chofer_id = $db->lastInsertId();

    // 2b. Auto-vincular a Unidad si aplica
    if ($invitacion['vehiculo_id']) {
        $stmt = $db->prepare("UPDATE vehiculos SET chofer_id = ? WHERE id = ? AND cooperativa_id = ?");
        $stmt->execute([$chofer_id, $invitacion['vehiculo_id'], $invitacion['cooperativa_id']]);
    }

    // 3. Marcar Token como usado
    $stmt = $db->prepare("UPDATE invitaciones SET usado = TRUE WHERE token = ?");
    $stmt->execute([$token]);

    echo json_encode(['status' => 'success', 'message' => 'Registro de chofer completado']);
}
