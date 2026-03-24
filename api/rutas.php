<?php
/**
 * Routes & Odometer Tracking
 */
require_once __DIR__ . '/includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();
$coop_id = $user['cooperativa_id'];

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? ''; // start_route, end_route

        if ($action === 'start_route') {
            $vehiculo_id = $data['vehiculo_id'] ?? null;
            $odometro_valor = $data['odometro_valor'] ?? null;
            $foto_path = $data['foto_path'] ?? '';

            if (!$vehiculo_id || !$odometro_valor) {
                sendResponse(['error' => 'Vehiculo and odometer value are required'], 400);
            }

            try {
                $db->beginTransaction();

                // 1. Create Route with payment info
                $stmt = $db->prepare("INSERT INTO rutas (cooperativa_id, vehiculo_id, chofer_id, estado, monto_efectivo, monto_pagomovil) 
                                     VALUES (:coop_id, :vehiculo_id, :chofer_id, 'activa', :efectivo, :pagomovil)");
                $stmt->execute([
                    'coop_id' => $coop_id,
                    'vehiculo_id' => $vehiculo_id,
                    'chofer_id' => $user['user_id'],
                    'efectivo' => $data['monto_efectivo'] ?? 0,
                    'pagomovil' => $data['monto_pagomovil'] ?? 0
                ]);
                $ruta_id = $db->lastInsertId();

                // 2. Log Odometer (Start)
                $stmt = $db->prepare("INSERT INTO odometros (cooperativa_id, ruta_id, tipo, valor, foto_path) 
                                     VALUES (:coop_id, :ruta_id, 'inicio', :valor, :foto)");
                $stmt->execute([
                    'coop_id' => $coop_id,
                    'ruta_id' => $ruta_id,
                    'valor' => $odometro_valor,
                    'foto' => $foto_path
                ]);

                $db->commit();
                sendResponse(['message' => 'Route started', 'ruta_id' => $ruta_id]);
            } catch (Exception $e) {
                $db->rollBack();
                sendResponse(['error' => 'Failed to start route: ' . $e->getMessage()], 500);
            }

        } elseif ($action === 'end_route') {
            $ruta_id = $data['ruta_id'] ?? null;
            $odometro_valor = $data['odometro_valor'] ?? null;
            $foto_path = $data['foto_path'] ?? '';

            if (!$ruta_id || !$odometro_valor) {
                sendResponse(['error' => 'Ruta ID and odometer value are required'], 400);
            }

            try {
                $db->beginTransaction();

                // 1. Update Route
                $stmt = $db->prepare("UPDATE rutas SET estado = 'finalizada', ended_at = CURRENT_TIMESTAMP 
                                     WHERE id = :ruta_id AND cooperativa_id = :coop_id AND chofer_id = :chofer_id");
                $stmt->execute([
                    'ruta_id' => $ruta_id,
                    'coop_id' => $coop_id,
                    'chofer_id' => $user['user_id']
                ]);

                if ($stmt->rowCount() === 0) {
                    throw new Exception("Route not found or unauthorized");
                }

                // 2. Log Odometer (End)
                $stmt = $db->prepare("INSERT INTO odometros (cooperativa_id, ruta_id, tipo, valor, foto_path) 
                                     VALUES (:coop_id, :ruta_id, 'fin', :valor, :foto)");
                $stmt->execute([
                    'coop_id' => $coop_id,
                    'ruta_id' => $ruta_id,
                    'valor' => $odometro_valor,
                    'foto' => $foto_path
                ]);

                // 3. Trigger Daily Fee (If not already paid for today)
                // Get vehicle and payment info from route
                $stmt = $db->prepare("SELECT vehiculo_id, monto_efectivo, monto_pagomovil FROM rutas WHERE id = :ruta_id");
                $stmt->execute(['ruta_id' => $ruta_id]);
                $route_info = $stmt->fetch();
                $vid = $route_info['vehiculo_id'];
                $efectivo = $route_info['monto_efectivo'];
                $pagomovil = $route_info['monto_pagomovil'];

                $stmt = $db->prepare("SELECT cuota_diaria FROM vehiculos WHERE id = :vid");
                $stmt->execute(['vid' => $vid]);
                $v = $stmt->fetch();
                $cuota = $v['cuota_diaria'];

                $fecha_hoy = date('Y-m-d');
                $stmt = $db->prepare("INSERT IGNORE INTO pagos_diarios (cooperativa_id, vehiculo_id, chofer_id, monto, monto_efectivo, monto_pagomovil, fecha) 
                                     VALUES (:coop_id, :vid, :chofer_id, :monto, :efectivo, :pagomovil, :fecha)");
                $stmt->execute([
                    'coop_id' => $coop_id,
                    'vid' => $vid,
                    'chofer_id' => $user['user_id'],
                    'monto' => $cuota,
                    'efectivo' => $efectivo,
                    'pagomovil' => $pagomovil,
                    'fecha' => $fecha_hoy
                ]);

                $db->commit();

                // 4. Alert Engine Logic (Cerebro)
                $stmt = $db->prepare("SELECT r.*, v.placa, u.telegram_id, u.nombre as dueno_nombre,
                                     (SELECT valor FROM odometros WHERE ruta_id = r.id AND tipo = 'inicio') as odometro_inicio
                                     FROM rutas r 
                                     JOIN vehiculos v ON r.vehiculo_id = v.id 
                                     JOIN usuarios u ON v.dueno_id = u.id
                                     WHERE r.id = :ruta_id");
                $stmt->execute(['ruta_id' => $ruta_id]);
                $ruta_info = $stmt->fetch();

                if ($ruta_info && $ruta_info['telegram_id']) {
                    require_once 'notificaciones.php';
                    $distancia = $odometro_valor - $ruta_info['odometro_inicio'];
                    
                    if ($distancia > 50) {
                         $msg = "⚠️ *ALERTA DE SEGURIDAD - TuCooperativa*\n\n";
                         $msg .= "Se detectó un recorrido inusual en la unidad *{$ruta_info['placa']}*.\n";
                         $msg .= "Recorrido: {$distancia} KM.\n";
                         $msg .= "Estado: *BAJO REVISIÓN POR POSIBLE ORDEÑO*";
                         sendTelegramNotification($ruta_info['telegram_id'], $msg);
                    } else {
                         $msg = "✅ *Viaje Finalizado - TuCooperativa*\n\n";
                         $msg .= "Unidad: *{$ruta_info['placa']}*\n";
                         $msg .= "Recorrido: {$distancia} KM.\n";
                         $msg .= "Estado: Normal.";
                         sendTelegramNotification($ruta_info['telegram_id'], $msg);
                    }
                }

                // 5. Mantenimiento Predictivo logic
                $stmt = $db->prepare("UPDATE mantenimientos 
                                     SET km_restantes = km_restantes - ? 
                                     WHERE vehiculo_id = ?");
                $stmt->execute([$distancia, $vid]);

                // 6. Check for low maintenance alerts
                $stmt = $db->prepare("SELECT * FROM mantenimientos WHERE vehiculo_id = ? AND km_restantes < 500");
                $stmt->execute([$vid]);
                $low_maint = $stmt->fetchAll();

                foreach ($low_maint as $m) {
                    $msg = "🔧 *MANTENIMIENTO REQUERIDO*\n\n";
                    $msg .= "Unidad: *{$ruta_info['placa']}*\n";
                    $msg .= "Servicio: *{$m['tipo']}*\n";
                    $msg .= "Kilómetros restantes: *{$m['km_restantes']} KM*\n";
                    $msg .= "¡Favor agendar servicio pronto!";
                    sendTelegramNotification($ruta_info['telegram_id'], $msg);
                }

                sendResponse(['message' => 'Route ended, fee logged, and maintenance updated']);
            } catch (Exception $e) {
                $db->rollBack();
                sendResponse(['error' => 'Failed to end route: ' . $e->getMessage()], 500);
            }

        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        break;

    case 'GET':
        // List active routes for this cooperative
        $stmt = $db->prepare("SELECT r.*, v.placa, u.nombre as chofer_nombre 
                             FROM rutas r 
                             JOIN vehiculos v ON r.vehiculo_id = v.id 
                             JOIN usuarios u ON r.chofer_id = u.id 
                             WHERE r.cooperativa_id = :coop_id AND r.estado = 'activa'");
        $stmt->execute(['coop_id' => $coop_id]);
        sendResponse($stmt->fetchAll());
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
        break;
}
