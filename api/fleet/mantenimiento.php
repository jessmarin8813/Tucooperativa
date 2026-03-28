<?php
/**
 * API: Granular Maintenance Tracking
 * Path: api/mantenimiento.php
 */
require_once '../includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();
$coop_id = $user['cooperativa_id'];

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Fetch all vehicles with their maintenance items
        $stmt = $db->prepare("SELECT v.id as vehiculo_id, v.placa, 
                             (SELECT valor FROM odometros WHERE cooperativa_id = v.cooperativa_id AND ruta_id IN (SELECT id FROM rutas WHERE vehiculo_id = v.id) ORDER BY created_at DESC LIMIT 1) as odometro_actual,
                             m.id as item_id, m.nombre, m.frecuencia, m.ultimo_odometro,
                             (SELECT SUM(monto) FROM gastos WHERE mantenimiento_item_id = m.id) as total_gastado
                             FROM vehiculos v
                             LEFT JOIN mantenimiento_items m ON v.id = m.vehiculo_id
                             WHERE v.cooperativa_id = :coop_id");
        $stmt->execute(['coop_id' => $coop_id]);
        $rows = $stmt->fetchAll();


        // Group items by vehicle
        $health_report = [];
        foreach ($rows as $r) {
            $vid = $r['vehiculo_id'];
            if (!isset($health_report[$vid])) {
                $health_report[$vid] = [
                    'id' => $vid,
                    'placa' => $r['placa'],
                    'odometro_actual' => floatval($r['odometro_actual'] ?? 0),
                    'items' => []
                ];
            }

            if ($r['item_id']) {
                $current = $health_report[$vid]['odometro_actual'];
                $last = floatval($r['ultimo_odometro']);
                $freq = intval($r['frecuencia']);
                $km_since = $current - $last;
                $progress = ($freq > 0) ? ($km_since / $freq) * 100 : 0;
                
                $status = 'ok';
                if ($progress >= 100) $status = 'critico';
                else if ($progress >= 85) $status = 'advertencia';

                $health_report[$vid]['items'][] = [
                    'id' => $r['item_id'],
                    'nombre' => $r['nombre'],
                    'frecuencia' => $freq,
                    'ultimo_odometro' => $last,
                    'km_desde_servicio' => $km_since,
                    'progreso' => min(100, round($progress, 2)),
                    'estado' => $status,
                    'km_restantes' => max(0, $freq - $km_since),
                    'total_gastado' => floatval($r['total_gastado'] ?? 0)
                ];

            }
        }

        sendResponse(array_values($health_report));
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';

        if ($action === 'record_service') {
            $item_id = $data['item_id'] ?? null;
            $odometro = $data['odometro_valor'] ?? null;

            if (!$item_id || !$odometro) sendResponse(['error' => 'Datos incompletos'], 400);

            $stmt = $db->prepare("UPDATE mantenimiento_items SET ultimo_odometro = :odo 
                                 WHERE id = :id");
            $stmt->execute(['odo' => $odo, 'id' => $item_id]);

            // Si el ítem es crítico, el sistema a nivel de DB o trigger suele manejar el estado,
            // pero nos aseguramos de marcar el cambio de estado si corresponde.
            $stmtVeh = $db->prepare("UPDATE vehiculos SET estado = 'mantenimiento', status_changed_at = NOW() WHERE id = (SELECT vehiculo_id FROM mantenimiento_items WHERE id = ?)");
            $stmtVeh->execute([$item_id]);
            
            sendResponse(['message' => 'Servicio registrado correctamente']);
        } elseif ($action === 'add_item') {
            $vid = $data['vehiculo_id'] ?? null;
            $nombre = $data['nombre'] ?? '';
            $frecuencia = $data['frecuencia'] ?? 5000;
            $ultimo_odo = $data['ultimo_odometro'] ?? 0;

            if (!$vid || !$nombre) sendResponse(['error' => 'Faltan campos'], 400);

            $stmt = $db->prepare("INSERT INTO mantenimiento_items (vehiculo_id, nombre, frecuencia, ultimo_odometro) 
                                 VALUES (:vid, :nombre, :frec, :odo)");
            $stmt->execute(['vid' => $vid, 'nombre' => $nombre, 'frec' => $frecuencia, 'odo' => $ultimo_odo]);
            
            sendResponse(['success' => true, 'id' => $db->lastInsertId()]);
        } else {
            sendResponse(['error' => 'Acción inválida'], 400);
        }
        break;

    default:
        sendResponse(['error' => 'Método no permitido'], 405);
        break;
}
