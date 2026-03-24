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

    // 1. Validar Token
    $stmt = $db->prepare("SELECT * FROM invitaciones WHERE token = ? AND usado = FALSE");
    $stmt->execute([$token]);
    $invitacion = $stmt->fetch();

    if (!$invitacion) {
        http_response_code(404);
        echo json_encode(['error' => 'Token inválido o ya usado']);
        exit;
    }

    // 2. Registrar/Vincular Chofer
    // Si el usuario ya existe con ese telegram_id, solo lo vinculamos a la nueva cooperativa
    // Pero el requerimiento dice registro nativo, así que creamos el usuario
    $stmt = $db->prepare("INSERT INTO usuarios (cooperativa_id, nombre, telegram_id, rol) VALUES (?, ?, ?, 'chofer')");
    $stmt->execute([$invitacion['cooperativa_id'], $nombre, $telegram_id]);

    // 3. Marcar Token como usado
    $stmt = $db->prepare("UPDATE invitaciones SET usado = TRUE WHERE token = ?");
    $stmt->execute([$token]);

    echo json_encode(['status' => 'success', 'message' => 'Registro completado via Deep Link']);
}
