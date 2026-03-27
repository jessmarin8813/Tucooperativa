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

    // Forzar salida JSON y silenciar advertencias para evitar romper el parser JS
    header('Content-Type: application/json');
    error_reporting(0);

    try {
        $db = DB::getInstance();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit;
    }
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

        // 2. Vincular Telegram en Usuario (Unificamos telegram_chat_id y telegram_id)
        $stmt = $db->prepare("UPDATE usuarios SET telegram_chat_id = ?, telegram_id = ?, telegram_link_token = NULL WHERE id = ?");
        $stmt->execute([$telegram_id, $telegram_id, $user['id']]);

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

    // 2. Registrar Chofer (Unificamos telegram_chat_id y telegram_id)
    $stmt = $db->prepare("INSERT INTO usuarios (cooperativa_id, nombre, cedula, telegram_chat_id, telegram_id, rol) VALUES (?, ?, ?, ?, ?, 'chofer')");
    $stmt->execute([$invitacion['cooperativa_id'], $nombre, $cedula, $telegram_id, $telegram_id]);
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
