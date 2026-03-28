<?php
/**
 * API: Professional Workshop Pipeline (Diagnosis + Spare Parts + Reactivation)
 * Path: api/fleet/workshop.php
 */
require_once __DIR__ . '/../includes/middleware.php';
require_once __DIR__ . '/../includes/realtime.php';
require_once __DIR__ . '/../includes/telegram_helper.php';

$user = checkAuth();
$db = DB::getInstance();
$coop_id = $user['cooperativa_id'];

if (!$coop_id) {
    sendResponse(['error' => 'No organization assigned'], 403);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $vehiculo_id = $_GET['vehiculo_id'] ?? null;
        $history = isset($_GET['history']);

        if ($history) {
            // Retrieve all incidents for a vehicle or the entire coop, including their aggregate costs
            $sql = "SELECT i.*, v.placa, 
                    (SELECT SUM(monto) FROM gastos WHERE incidencia_id = i.id) as total_gasto
                    FROM incidencias i
                    JOIN vehiculos v ON i.vehiculo_id = v.id
                    WHERE v.cooperativa_id = :coop_id";
            
            if ($vehiculo_id) $sql .= " AND i.vehiculo_id = :vid";
            $sql .= " ORDER BY i.created_at DESC";

            $stmt = $db->prepare($sql);
            $params = ['coop_id' => $coop_id];
            if ($vehiculo_id) $params['vid'] = $vehiculo_id;
            
            $stmt->execute($params);
            $all = $stmt->fetchAll();

            // Fetch expenses for each incident in the history
            foreach ($all as &$inc) {
                $stmtE = $db->prepare("SELECT * FROM gastos WHERE incidencia_id = ?");
                $stmtE->execute([$inc['id']]);
                $inc['expenses'] = $stmtE->fetchAll();
            }

            sendResponse($all);
            break;
        }

        // Default: Get the active (most recent) incident for a specific vehicle in maintenance
        if (!$vehiculo_id) sendResponse(['error' => 'Missing vehicle ID'], 400);

        $stmt = $db->prepare("SELECT i.*, v.placa, v.modelo, v.estado as vehiculo_estado
                             FROM incidencias i
                             JOIN vehiculos v ON i.vehiculo_id = v.id
                             WHERE i.vehiculo_id = :vid AND v.cooperativa_id = :coop_id
                             ORDER BY i.created_at DESC LIMIT 1");
        $stmt->execute(['vid' => $vehiculo_id, 'coop_id' => $coop_id]);
        $incident = $stmt->fetch();

        if (!$incident) sendResponse(['error' => 'No active incident found'], 404);

        // Also fetch related expenses (repuestos)
        $stmtE = $db->prepare("SELECT * FROM gastos WHERE incidencia_id = ?");
        $stmtE->execute([$incident['id']]);
        $incident['expenses'] = $stmtE->fetchAll();

        sendResponse($incident);
        break;

    case 'PUT':
        // Update technical diagnosis or solution
        $data = json_decode(file_get_contents('php://input'), true);
        $incident_id = $data['id'] ?? null;
        if (!$incident_id) sendResponse(['error' => 'Missing incident ID'], 400);

        $diag = $data['diagnostico'] ?? null;
        $sol = $data['solucion'] ?? null;

        $updates = [];
        $params = ['id' => $incident_id];

        if ($diag !== null) { $updates[] = "diagnostico = :diag"; $params['diag'] = $diag; }
        if ($sol !== null) { $updates[] = "solucion = :sol"; $params['sol'] = $sol; }

        if (empty($updates)) sendResponse(['error' => 'Nothing to update'], 400);

        $sql = "UPDATE incidencias SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        sendResponse(['success' => true, 'message' => 'Technical info updated']);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';

        if ($action === 'add_expense') {
            $inc_id = $data['incidencia_id'] ?? null;
            $vid = $data['vehiculo_id'] ?? null;
            $monto = $data['monto'] ?? 0;
            $desc = $data['descripcion'] ?? 'Repuesto/Servicio';
            $cat = $data['categoria'] ?? 'repuestos';

            if (!$inc_id || !$vid || !$monto) sendResponse(['error' => 'Incomplete data'], 400);

            $stmt = $db->prepare("INSERT INTO gastos (cooperativa_id, vehiculo_id, incidencia_id, categoria, monto, moneda, tasa_cambio, descripcion, fecha) 
                                 VALUES (?, ?, ?, ?, ?, 'USD', (SELECT tasa FROM tasas_cambio ORDER BY created_at DESC LIMIT 1), ?, CURDATE())");
            $stmt->execute([$coop_id, $vid, $inc_id, $cat, $monto, $desc]);

            sendResponse(['success' => true, 'id' => $db->lastInsertId()]);

        } elseif ($action === 'finalize_repair') {
            $inc_id = $data['incidencia_id'] ?? null;
            $vid = $data['vehiculo_id'] ?? null;
            $solucion = $data['solucion'] ?? 'Reparación completada';

            if (!$inc_id || !$vid) sendResponse(['error' => 'Incomplete data'], 400);

            // 1. Update Vehicle to Active
            $stmtV = $db->prepare("UPDATE vehiculos SET estado = 'activo', status_changed_at = NOW() WHERE id = ?");
            $stmtV->execute([$vid]);

            // 2. Finalize Incident
            $stmtI = $db->prepare("UPDATE incidencias SET solucion = ? WHERE id = ?");
            $stmtI->execute([$solucion, $inc_id]);

            // 3. Notify Driver (Telegram)
            $stmtD = $db->prepare("SELECT c.telegram_id, v.placa FROM vehiculos v JOIN choferes c ON v.chofer_id = c.id WHERE v.id = ?");
            $stmtD->execute([$vid]);
            $driver = $stmtD->fetch();

            if ($driver && $driver['telegram_id']) {
                $msg = "✅ *UNIDAD LISTA PARA RUTA*\n\n" .
                       "📍 Unidad: `{$driver['placa']}`\n" .
                       "🔧 Reparación: *COMPLETADA*\n" .
                       "🚦 Ya puedes iniciar tu jornada desde el bot.";
                sendTelegramNotification($driver['telegram_id'], $msg);
            }

            // Realtime Broadcast
            broadcastRealtime('UPDATE_FLEET', ['cooperativa_id' => $coop_id]);

            sendResponse(['success' => true, 'message' => 'Vehicle reactivated and driver notified']);
        } else {
            sendResponse(['error' => 'Unsupported action'], 400);
        }
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
        break;
}
