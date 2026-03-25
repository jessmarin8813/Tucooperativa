<?php
/**
 * API: Reportar Incidencia de Vehículo
 * Path: api/fleet/reportar_incidencia.php
 */
require_once __DIR__ . '/../includes/middleware.php';

// El Bot se autentica vía Middleware (o por token si se prefiere, aquí usamos el estándar)
// NOTA: Para el Bot se suele simular la sesión o pasar el telegram_id
$db = DB::getInstance();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $tid = $data['telegram_id'] ?? '';
    $tipo = $data['tipo'] ?? 'otro';
    $desc = $data['descripcion'] ?? '';
    $foto = $data['foto_path'] ?? '';

    // 1. Identificar Usuario por Telegram ID
    $stmt = $db->prepare("SELECT id, cooperativa_id FROM usuarios WHERE telegram_id = ?");
    $stmt->execute([$tid]);
    $user = $stmt->fetch();

    if (!$user) {
        sendResponse(['error' => 'Usuario no vinculado'], 401);
    }

    // 2. Identificar Vehículo Activo del Chofer (usamos el último asignado o la ruta activa)
    $stmt = $db->prepare("SELECT id FROM vehiculos WHERE chofer_id = ? LIMIT 1");
    $stmt->execute([$user['id']]);
    $vehicle = $stmt->fetch();

    if (!$vehicle) {
        sendResponse(['error' => 'No tienes vehículo asignado'], 400);
    }

    // 3. Registrar Incidencia
    $stmt = $db->prepare("INSERT INTO incidencias (cooperativa_id, vehiculo_id, chofer_id, tipo, descripcion, foto_path) 
                          VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $user['cooperativa_id'],
        $vehicle['id'],
        $user['id'],
        $tipo,
        $desc,
        $foto
    ]);

    sendResponse(['success' => true, 'message' => 'Falla reportada con éxito.']);
}
?>
