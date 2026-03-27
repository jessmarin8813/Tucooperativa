<?php
/**
 * Routes & Odometer Tracking
 */
require_once __DIR__ . '/../includes/middleware.php';

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

                // 0. GAP DETECTION (FORENSIC)
                $stmt = $db->prepare("SELECT valor FROM odometros WHERE cooperativa_id = :coop_id AND ruta_id IN (SELECT id FROM rutas WHERE vehiculo_id = :vid) ORDER BY id DESC LIMIT 1");
                $stmt->execute(['coop_id' => $coop_id, 'vid' => $vehiculo_id]);
                $last_odo_row = $stmt->fetch();
                $last_odo = $last_odo_row ? floatval($last_odo_row['valor']) : 0;
                $gap = floatval($odometro_valor) - $last_odo;

                // 1. Create Route (WITHOUT payment info at start)
                $stmt = $db->prepare("INSERT INTO rutas (cooperativa_id, vehiculo_id, chofer_id, estado) 
                                     VALUES (:coop_id, :vehiculo_id, :chofer_id, 'activa')");
                $stmt->execute([
                    'coop_id' => $coop_id,
                    'vehiculo_id' => $vehiculo_id,
                    'chofer_id' => $user['user_id']
                ]);

                $ruta_id = $db->lastInsertId();

                // Logic for Gap Alert Notification
                if ($last_odo > 0 && $gap > 1.0) { // More than 1km gap
                    // Fetch owner chat_id
                    $stmt = $db->prepare("SELECT u.telegram_id as telegram_chat_id, v.placa, c.nombre as chofer_name 
                                         FROM vehiculos v 
                                         JOIN usuarios u ON v.dueno_id = u.id 
                                         JOIN choferes c ON c.id = :chofer_id
                                         WHERE v.id = :vid");
                    $stmt->execute(['chofer_id' => $user['user_id'], 'vid' => $vehiculo_id]);
                    $owner_info = $stmt->fetch();

                    if ($owner_info && $owner_info['telegram_chat_id']) {
                        require_once __DIR__ . '/../includes/telegram_helper.php';
                        $msg = "🕵️‍♂️ **GAP DETECTADO - Uso No Reportado**\n\n";
                        $msg .= "Unidad: *{$owner_info['placa']}*\n";
                        $msg .= "Chofer: *{$owner_info['chofer_name']}*\n";
                        $msg .= "Inicio Actual: `{$odometro_valor} KM`\n";
                        $msg .= "Último Reporte: `{$last_odo} KM`\n";
                        $msg .= "⚠️ **BRECHA:** " . round($gap, 2) . " KM sin reportar.";
                        sendTelegramNotification($owner_info['telegram_chat_id'], $msg, $coop_id);
                    }
                }

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

                // 0. FETCH START ODOMETER FOR VALIDATION
                $stmt = $db->prepare("SELECT valor FROM odometros WHERE ruta_id = :ruta_id AND tipo = 'inicio'");
                $stmt->execute(['ruta_id' => $ruta_id]);
                $start_odo_row = $stmt->fetch();
                $start_odo = $start_odo_row ? floatval($start_odo_row['valor']) : 0;

                if (floatval($odometro_valor) <= $start_odo) {
                    throw new Exception("El odómetro final ($odometro_valor) debe ser mayor al inicial ($start_odo).");
                }

                // 0. CALCULATE SUGGESTED QUOTA BASED ON TIME
                $stmt = $db->prepare("SELECT started_at, vehiculo_id FROM rutas WHERE id = ?");
                $stmt->execute([$ruta_id]);
                $r_data = $stmt->fetch();
                
                $start = strtotime($r_data['started_at']);
                $diff_hours = (time() - $start) / 3600;
                
                $stmt = $db->prepare("SELECT cuota_diaria FROM vehiculos WHERE id = ?");
                $stmt->execute([$r_data['vehiculo_id']]);
                $full_cuota = $stmt->fetchColumn();
                
                $suggested_quota = ($diff_hours < 4) ? $full_cuota * 0.5 : $full_cuota;

                // 1. Update Route (WITH payment info now)
                $stmt = $db->prepare("UPDATE rutas SET estado = 'finalizada', ended_at = CURRENT_TIMESTAMP,
                                     monto_efectivo = :efectivo, monto_pagomovil = :pagomovil
                                     WHERE id = :ruta_id AND cooperativa_id = :coop_id");
                $stmt->execute([
                    'efectivo' => $data['monto_efectivo'] ?? 0,
                    'pagomovil' => $data['monto_pagomovil'] ?? 0,
                    'ruta_id' => $ruta_id,
                    'coop_id' => $coop_id
                ]);

                // 2. Log Odometer (End) - Already existing below
                
                // 3. Trigger Daily Fee (Note: We use recommended amount but reported payment)
                // This is audit only, the 'dias' count in mi_estado handles the actual debt.
                // We just log what was paid here for the record.
                $stmt = $db->prepare("INSERT INTO pagos_reportados (cooperativa_id, vehiculo_id, chofer_id, monto_total, monto_efectivo, monto_pagomovil, status) 
                                     VALUES (?, ?, ?, ?, ?, ?, 'aprobado')");
                $stmt->execute([
                    $coop_id, $r_data['vehiculo_id'], $user['user_id'],
                    ($data['monto_efectivo'] ?? 0) + ($data['monto_pagomovil'] ?? 0),
                    $data['monto_efectivo'] ?? 0,
                    $data['monto_pagomovil'] ?? 0
                ]);


                // 4. Fuel Audit Logic (Operational Intelligence) - Get route info again for full details
                $stmt = $db->prepare("SELECT r.*, v.placa, v.km_por_litro, v.odometro_mantenimiento, v.frecuencia_mantenimiento, u.telegram_id, u.nombre as dueno_nombre,
                                     (SELECT valor FROM odometros WHERE ruta_id = r.id AND tipo = 'inicio') as odometro_inicio
                                     FROM rutas r 
                                     JOIN vehiculos v ON r.vehiculo_id = v.id 
                                     JOIN usuarios u ON v.dueno_id = u.id
                                     WHERE r.id = :ruta_id");
                $stmt->execute(['ruta_id' => $ruta_id]);
                $ruta_info = $stmt->fetch();

                if ($ruta_info) {
                    $distancia = $odometro_valor - $ruta_info['odometro_inicio'];
                    $km_litro = $ruta_info['km_por_litro'] ?: 8.0;
                    $consumo_reportado = $data['combustible_reportado'] ?? 0;
                    
                    // Fuel Discrepancy Engine
                    $consumo_estimado = $distancia / $km_litro;
                    $alerta = 0;
                    
                    if ($consumo_estimado > 0) {
                        $diferencia_proc = abs($consumo_estimado - $consumo_reportado) / $consumo_estimado;
                        if ($diferencia_proc > 0.15) { // 15% threshold
                            $alerta = 1;
                        }
                    }

                    // Update Route with fuel data and alert
                    $stmt = $db->prepare("UPDATE rutas SET combustible_reportado = :fuel, alerta_combustible = :alerta WHERE id = :ruta_id");
                    $stmt->execute(['fuel' => $consumo_reportado, 'alerta' => $alerta, 'ruta_id' => $ruta_id]);

                    if ($ruta_info['telegram_id']) {
                        require_once __DIR__ . '/../includes/telegram_helper.php';
                        if ($alerta) {
                            $msg = "🚨 *ALERTA DE COMBUSTIBLE - TuCooperativa*\n\n";
                            $msg .= "Unidad: *{$ruta_info['placa']}*\n";
                            $msg .= "Recorrido: {$distancia} KM\n";
                            $msg .= "Consumo Est.: " . round($consumo_estimado, 2) . " L\n";
                            $msg .= "Reportado: " . round($consumo_reportado, 2) . " L\n";
                            $msg .= "⚠️ *DISCREPANCIA DETECTADA (>15%)*";
                            sendTelegramNotification($ruta_info['telegram_id'], $msg, $coop_id);
                        } else {
                            $msg = "✅ *Viaje Finalizado - TuCooperativa*\n\n";
                            $msg .= "Unidad: *{$ruta_info['placa']}*\n";
                            $msg .= "Recorrido: {$distancia} KM\n";
                            $msg .= "Estado: Normal.";
                            sendTelegramNotification($ruta_info['telegram_id'], $msg, $coop_id);
                        }
                    }
                }

                // 5. Mantenimiento Predictivo Granular (Phase 32)
                $stmtMaint = $db->prepare("SELECT * FROM mantenimiento_items WHERE vehiculo_id = ?");
                $stmtMaint->execute([$vid]);
                $items = $stmtMaint->fetchAll();
                
                $alertas_enviadas = [];
                foreach ($items as $item) {
                    $km_since_last = $odometro_valor - floatval($item['ultimo_odometro']);
                    $freq = intval($item['frecuencia']);
                    $km_restantes = $freq - $km_since_last;
                    
                    if ($km_restantes < 500) {
                        $estado = ($km_restantes <= 0) ? "VENCIDO" : "PRÓXIMO";
                        $alertas_enviadas[] = [
                            'item' => $item['nombre'],
                            'restantes' => max(0, $km_restantes),
                            'estado' => $estado
                        ];

                        if ($ruta_info['telegram_id']) {
                            $emoji = ($km_restantes <= 0) ? "🚨" : "⚠️";
                            $msg_maint = "$emoji *ALERTA DE MANTENIMIENTO*\n\n";
                            $msg_maint .= "Unidad: *{$ruta_info['placa']}*\n";
                            $msg_maint .= "Componente: *{$item['nombre']}*\n";
                            $msg_maint .= "Estado: *$estado*\n";
                            $msg_maint .= "Kilómetros restantes: *{$km_restantes} KM*\n";
                            $msg_maint .= "¡Favor agendar servicio!";
                            sendTelegramNotification($ruta_info['telegram_id'], $msg_maint, $coop_id);
                        }
                    }
                }

                $db->commit();
                sendResponse([
                    'message' => 'Ruta finalizada con éxito',
                    'alerta_fuel' => $alerta,
                    'distancia' => $distancia,
                    'mantenimiento' => [
                        'requerido' => ($km_restantes <= 0),
                        'km_restantes' => max(0, $km_restantes)
                    ]
                ]);
            } catch (Exception $e) {
                $db->rollBack();
                sendResponse(['error' => 'Failed to end route: ' . $e->getMessage()], 500);
            }

        } else {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        break;

    case 'GET':
        $active_for_me = $_GET['active_for_me'] ?? false;
        if ($active_for_me) {
            $stmt = $db->prepare("SELECT r.*, v.placa, 
                                 (SELECT valor FROM odometros WHERE ruta_id = r.id AND tipo = 'inicio') as odometro_inicio
                                 FROM rutas r 
                                 JOIN vehiculos v ON r.vehiculo_id = v.id 
                                 WHERE r.chofer_id = :chofer_id AND r.estado = 'activa' 
                                 LIMIT 1");
            $stmt->execute(['chofer_id' => $user['user_id']]);
            $res = $stmt->fetch();
            sendResponse($res ?: ['error' => 'No tienes una ruta activa actualmente']);
        }

        // List all active routes for this cooperative
        $stmt = $db->prepare("SELECT r.*, v.placa, c.nombre as chofer_nombre 
                             FROM rutas r 
                             JOIN vehiculos v ON r.vehiculo_id = v.id 
                             JOIN choferes c ON r.chofer_id = c.id 
                             WHERE r.cooperativa_id = :coop_id AND r.estado = 'activa'");
        $stmt->execute(['coop_id' => $coop_id]);
        sendResponse($stmt->fetchAll());
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
        break;
}
