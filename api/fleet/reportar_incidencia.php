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

    // 4. BLOQUEO DE UNIDAD: La unidad queda inactiva hasta reparación
    $stmt = $db->prepare("UPDATE vehiculos SET estado = 'inactivo' WHERE id = ?");
    $stmt->execute([$vehicle['id']]);

    // 5. DILEMA: ¿Qué pasa si estaba en ruta?
    // Buscamos si hay una ruta abierta para este chofer
    $stmt = $db->prepare("SELECT id FROM rutas WHERE chofer_id = ? AND status = 'abierta' LIMIT 1");
    $stmt->execute([$user['id']]);
    $active_route = $stmt->fetch();

    $suggested_quota = 0;
    if ($active_route) {
        // Marcamos la ruta como interrumpida por falla
        $stmt = $db->prepare("SELECT started_at, (SELECT cuota_diaria FROM vehiculos WHERE id = rutas.vehiculo_id) as cuota FROM rutas WHERE id = ?");
        $stmt->execute([$active_route['id']]);
        $r_data = $stmt->fetch();
        
        $start = strtotime($r_data['started_at']);
        $diff_hours = (time() - $start) / 3600;
        $suggested_quota = ($diff_hours < 4) ? $r_data['cuota'] * 0.5 : $r_data['cuota'];

        $stmt = $db->prepare("UPDATE rutas SET status = 'interrumpida', observacion = ? WHERE id = ?");
        $stmt->execute(["Interrumpida por falla: " . $desc, $active_route['id']]);
    }

    sendResponse([
        'success' => true, 
        'message' => 'Falla reportada. Unidad BLOQUEADA.',
        'suggested_quota' => $suggested_quota,
        'ruta_id' => $active_route ? $active_route['id'] : null
    ]);
}
?>


