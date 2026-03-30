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

try {
    switch ($method) {
        case 'GET':
            $vehiculo_id = $_GET['vehiculo_id'] ?? null;
            $history = isset($_GET['history']);

            if ($history) {
                $sql = "SELECT i.*, v.placa, 
                        (SELECT SUM(monto) FROM gastos WHERE incidencia_id = i.id) as total_gasto
                        FROM incidencias i
                        JOIN vehiculos v ON i.vehiculo_id = v.id
                        WHERE v.cooperativa_id = :coop_id 
                        AND i.resolved_at IS NOT NULL";
                
                if ($vehiculo_id) $sql .= " AND i.vehiculo_id = :vid";
                $sql .= " ORDER BY i.created_at DESC";

                $stmt = $db->prepare($sql);
                $stmt->execute(['coop_id' => $coop_id]);
                $all = $stmt->fetchAll();
                
                // Deduplicación Forzada Atómica (v40.3) - Brute-Force local
                $uniqueMap = [];
                foreach ($all as $row) {
                    $uniqueMap[$row['id']] = $row; // El mapa pisa duplicados por ID
                }
                $all = array_values($uniqueMap);

                // Registro forense para depuración (solo admin puede leer esto)
                error_log("AUDIT [History]: Found " . count($all) . " unique records for Coop ID $coop_id");
                
                // Backup Físico Forense (v40.3)
                $logDir = __DIR__ . '/../logs';
                if (!is_dir($logDir)) mkdir($logDir, 0777, true);
                file_put_contents($logDir . '/history_audit.json', json_encode([
                    'timestamp' => date('Y-m-d H:i:s'),
                    'user' => $user['user_id'],
                    'coop' => $coop_id,
                    'ids' => array_column($all, 'id'),
                    'count' => count($all)
                ]));

                foreach ($all as &$inc) {
                    $stmtE = $db->prepare("SELECT * FROM gastos WHERE incidencia_id = ?");
                    $stmtE->execute([$inc['id']]);
                    $inc['expenses'] = $stmtE->fetchAll();
                }

                // Inyectamos metadatos para diagnóstico v39.1
                sendResponse([
                    'status' => 'success',
                    'data' => $all,
                    'debug' => [
                        'user_id' => $user['id'],
                        'coop_id' => $coop_id,
                        'count' => count($all)
                    ]
                ]);
                break;
            }

            if (!$vehiculo_id) sendResponse(['error' => 'Missing vehicle ID'], 400);

            $stmtV = $db->prepare("SELECT placa, modelo, estado FROM vehiculos WHERE id = ? AND cooperativa_id = ?");
            $stmtV->execute([$vehiculo_id, $coop_id]);
            $vehiculo = $stmtV->fetch();
            if (!$vehiculo) sendResponse(['error' => 'Vehicle not found or no access'], 404);

            $stmtI = $db->prepare("SELECT * FROM incidencias 
                                  WHERE vehiculo_id = :vid AND resolved_at IS NULL 
                                  ORDER BY created_at DESC");
            $stmtI->execute(['vid' => $vehiculo_id]);
            $incidents = $stmtI->fetchAll();

            $expenses = [];
            if (!empty($incidents)) {
                $incIds = array_map(function($i) { return $i['id']; }, $incidents);
                $placeholders = implode(',', array_fill(0, count($incIds), '?'));
                $stmtE = $db->prepare("SELECT * FROM gastos WHERE incidencia_id IN ($placeholders)");
                $stmtE->execute($incIds);
                $expenses = $stmtE->fetchAll();
            }

            sendResponse([
                'vehiculo' => $vehiculo,
                'incidents' => $incidents,
                'expenses' => $expenses,
                'latest' => $incidents[0] ?? null 
            ]);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $incident_id = $data['id'] ?? null;
            if (!$incident_id) throw new Exception("ID de reporte faltante para diagnóstico.");

            $diag = $data['diagnostico'] ?? null;
            $sol = $data['solucion'] ?? null;

            $updates = [];
            $params = ['id' => $incident_id];

            if ($diag !== null) { $updates[] = "diagnostico = :diag"; $params['diag'] = $diag; }
            if ($sol !== null) { $updates[] = "solucion = :sol"; $params['sol'] = $sol; }

            if (empty($updates)) throw new Exception("Nada que actualizar.");

            $sql = "UPDATE incidencias SET " . implode(', ', $updates) . " WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);

            sendResponse(['success' => true, 'message' => 'Info técnica actualizada.']);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $action = $data['action'] ?? '';

            if ($action === 'add_expense') {
                $inc_id = $data['incidencia_id'] ?? null;
                $vid = $data['vehiculo_id'] ?? null;
                $monto = $data['monto'] ?? 0;
                $moneda = $data['moneda'] ?? 'USD';
                $tasa = $data['tasa_cambio'] ?? null;
                $desc = $data['descripcion'] ?? 'Repuesto/Servicio';
                $cat = $data['categoria'] ?? 'repuestos';

                if (!$inc_id || !$vid || !$monto) throw new Exception("Datos incompletos para añadir gasto.");

                // Si no se envía tasa, buscamos la última registrada
                if (!$tasa) {
                    $stmtRate = $db->prepare("SELECT tasa FROM tasas_cambio ORDER BY created_at DESC LIMIT 1");
                    $stmtRate->execute();
                    $rateRow = $stmtRate->fetch();
                    $tasa = $rateRow['tasa'] ?? 1.0;
                }

                $stmt = $db->prepare("INSERT INTO gastos (cooperativa_id, vehiculo_id, incidencia_id, categoria, monto, moneda, tasa_cambio, descripcion, fecha) 
                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())");
                $stmt->execute([$coop_id, $vid, $inc_id, $cat, $monto, $moneda, $tasa, $desc]);

                sendResponse(['success' => true, 'id' => $db->lastInsertId()]);

            } elseif ($action === 'edit_expense') {
                $eid = $data['id'] ?? null;
                $monto = $data['monto'] ?? null;
                $desc = $data['descripcion'] ?? null;

                if (!$eid || $monto === null) throw new Exception("Faltan datos para editar el gasto.");

                $stmt = $db->prepare("UPDATE gastos SET monto = ?, descripcion = ? WHERE id = ? AND cooperativa_id = ?");
                $stmt->execute([$monto, $desc, $eid, $coop_id]);

                sendResponse(['success' => true, 'message' => 'Gasto actualizado correctamente']);

            } elseif ($action === 'delete_expense') {
                $eid = $data['id'] ?? null;
                if (!$eid) throw new Exception("ID de gasto faltante para eliminación.");

                $stmt = $db->prepare("DELETE FROM gastos WHERE id = ? AND cooperativa_id = ?");
                $stmt->execute([$eid, $coop_id]);

                sendResponse(['success' => true, 'message' => 'Gasto eliminado correctamente']);

            } elseif ($action === 'finalize_repair') {
                $vid = $data['vehiculo_id'] ?? null;
                $solucion = $data['solucion'] ?? 'Reparación integral completada';

                if (!$vid) throw new Exception("Falta ID de vehículo para reactivación.");

                $db->beginTransaction();

                // 1. Reactivar Vehículo
                $stmtV = $db->prepare("UPDATE vehiculos SET estado = 'activo', status_changed_at = NOW() WHERE id = ?");
                $stmtV->execute([$vid]);

                // 2. Cerrar todas las incidencias pendientes (NULAS o VACÍAS)
                $stmtI = $db->prepare("UPDATE incidencias SET solucion = ?, resolved_at = NOW() WHERE vehiculo_id = ? AND (solucion IS NULL OR solucion = '')");
                $stmtI->execute([$solucion, $vid]);

                $db->commit();

                // 3. Notificación al Chofer
                $sqlD = "SELECT c.telegram_id, v.placa FROM vehiculos v 
                         INNER JOIN choferes c ON v.chofer_id = c.id 
                         WHERE v.id = ?";
                $stmtD = $db->prepare($sqlD);
                $stmtD->execute([$vid]);
                $driver = $stmtD->fetch();

                if ($driver && !empty($driver['telegram_id'])) {
                    $msg = "✅ *UNIDAD LISTA PARA RUTA*\n\n" .
                           "📍 Unidad: `{$driver['placa']}`\n" .
                           "🔧 Reparación: *COMPLETADA*\n" .
                           "🚦 La unidad ya aparece como OPERATIVA. Puedes iniciar jornada.";
                    sendTelegramNotification($driver['telegram_id'], $msg);
                }

                broadcastRealtime('UPDATE_FLEET', ['cooperativa_id' => $coop_id]);
                sendResponse(['success' => true, 'message' => 'Unidad reactivada y reportes cerrados.']);

            } elseif ($action === 'add_incident_from_workshop') {
                $vid = $data['vehiculo_id'] ?? null;
                $desc = $data['descripcion'] ?? '';
                if (!$vid || !$desc) throw new Exception("Faltan datos para la observación técnica.");

                $stmt = $db->prepare("INSERT INTO incidencias (cooperativa_id, vehiculo_id, chofer_id, tipo, descripcion, foto_path, created_at) 
                                     VALUES (?, ?, 0, 'Tecnica', ?, 'uploads/no-photo.jpg', NOW())");
                $stmt->execute([$coop_id, $vid, $desc]);

                sendResponse(['success' => true, 'message' => 'Hallazgo adicional registrado.']);

            } elseif ($action === 'edit_incident') {
                $inc_id = $data['id'] ?? null;
                $desc = $data['descripcion'] ?? null;
                if (!$inc_id || !$desc) throw new Exception("Faltan datos para editar reporte.");

                $stmt = $db->prepare("UPDATE incidencias SET descripcion = ? WHERE id = ? AND cooperativa_id = ?");
                $stmt->execute([$desc, $inc_id, $coop_id]);

                sendResponse(['success' => true, 'message' => 'Reporte actualizado.']);
                
            } elseif ($action === 'delete_incident') {
                $inc_id = $data['id'] ?? null;
                if (!$inc_id) throw new Exception("ID de reporte faltante.");

                $stmt = $db->prepare("DELETE FROM incidencias WHERE id = ? AND cooperativa_id = ?");
                $stmt->execute([$inc_id, $coop_id]);

                sendResponse(['success' => true, 'message' => 'Reporte descartado.']);
            }
            break;

        default:
            sendResponse(['error' => 'Method not allowed'], 405);
            break;
    }
} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    sendResponse(['error' => 'Error de Taller', 'message' => $e->getMessage()], 500);
}
?>
