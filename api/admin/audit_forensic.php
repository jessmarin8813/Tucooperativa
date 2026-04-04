<?php
/**
 * API: Forensic Audit & Fraud Detection
 * Detects: Impossible Trips, Dead Mileage, and Odometer Tampering.
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
if (!in_array($user['rol'], ['superadmin', 'dueno'])) {
    sendResponse(['error' => 'Forbidden'], 403);
}

$coop_id = in_array($user['rol'], ['dueno']) ? $user['cooperativa_id'] : null;

$db = DB::getInstance();

try {
    $incidencias = [];

    // 0. Timezone & Working Hours Check (Hora Prudente: 8 AM - 8 PM)
    date_default_timezone_set('America/Caracas');
    $hora_actual = (int)date('H');
    $es_hora_prudente = ($hora_actual >= 8 && $hora_actual < 20);

    // 1. Detection: Dead Mileage (Kilometraje Muerto)
    $query = "
        SELECT 
            v.placa, v.modelo,
            r.id, r.started_at, r.ended_at,
            COALESCE(u.nombre, 'Chofer Desconocido') as chofer_nombre,
            c.nombre as coop_nombre,
            odo_ini.valor as odo_inicio,
            odo_fin.valor as odo_fin
        FROM rutas r
        LEFT JOIN choferes u ON r.chofer_id = u.id
        JOIN cooperativas c ON r.cooperativa_id = c.id
        JOIN vehiculos v ON r.vehiculo_id = v.id
        JOIN odometros odo_ini ON r.id = odo_ini.ruta_id AND odo_ini.tipo = 'inicio'
        JOIN odometros odo_fin ON r.id = odo_fin.ruta_id AND odo_fin.tipo = 'fin'
        WHERE r.estado = 'finalizada'
        " . ($coop_id ? "AND r.cooperativa_id = :coop_id" : "") . "
        ORDER BY v.id, r.ended_at DESC
        LIMIT 200
    ";

    $stmt = $db->prepare($query);
    $stmt->execute($coop_id ? ['coop_id' => $coop_id] : []);
    $routes = $stmt->fetchAll();

    $last_route_per_vehicle = [];
    foreach ($routes as $r) {
        $placa = $r['placa'];
        $odo_ini = (float)$r['odo_inicio'];
        $odo_fin = (float)$r['odo_fin'];
        
        // Dead Mileage Check
        if (isset($last_route_per_vehicle[$placa])) {
            $next_start = (float)$last_route_per_vehicle[$placa]['odo_inicio'];
            $dead_km = $next_start - $odo_fin;
            
            if ($dead_km > 2) {
                $incidencias[] = [
                    'tipo' => 'Kilometraje Muerto',
                    'nivel' => 'alto',
                    'modulo' => 'Flota/Movilidad',
                    'evento' => 'Desvío No Reportado',
                    'usuario' => $r['chofer_nombre'],
                    'placa' => $r['placa'],
                    'modelo' => $r['modelo'],
                    'ip' => '-',
                    'descripcion' => "Desvío de " . round($dead_km, 1) . " km detectado entre rutas de la unidad {$r['placa']}.",
                    'fecha' => $r['ended_at']
                ];
            }
        }
        $last_route_per_vehicle[$placa] = $r;
    }

    // 2. Detection: Inreconciled Income (Cajas Pendientes > 12h)
    $query_caja = "
        SELECT 
            r.id, r.ended_at, 
            COALESCE(u.nombre, 'Chofer Desconocido') as chofer_nombre, 
            c.nombre as coop_nombre,
            v.placa, v.modelo,
            odo_ini.valor as km_inicial,
            odo_fin.valor as km_final
        FROM rutas r
        LEFT JOIN choferes u ON r.chofer_id = u.id
        JOIN vehiculos v ON r.vehiculo_id = v.id
        JOIN cooperativas c ON r.cooperativa_id = c.id
        LEFT JOIN pagos_reportados p ON r.id = p.id_ruta
        JOIN odometros odo_ini ON r.id = odo_ini.ruta_id AND odo_ini.tipo = 'inicio'
        WHERE r.estado = 'finalizada'
        AND r.ended_at < (NOW() - INTERVAL 12 HOUR)
        AND p.id IS NULL
        AND (r.monto_efectivo + r.monto_pagomovil) = 0
        " . ($coop_id ? "AND r.cooperativa_id = :coop_id" : "") . "
        LIMIT 50
    ";
    
    $stmtCaja = $db->prepare($query_caja);
    $stmtCaja->execute($coop_id ? ['coop_id' => $coop_id] : []);
    foreach ($stmtCaja->fetchAll() as $caja) {
        $is_zero_km = (floatval($caja['km_final']) <= floatval($caja['km_inicial']));
        $incidencias[] = [
            'tipo' => 'Brecha de Auditoría',
            'nivel' => 'alto',
            'modulo' => 'Administración',
            'evento' => $is_zero_km ? 'Cierre con Movimiento Nulo' : 'Cierre Sin Conciliar',
            'usuario' => $caja['chofer_nombre'],
            'placa' => $caja['placa'],
            'modelo' => $caja['modelo'],
            'ip' => '-',
            'descripcion' => $is_zero_km 
                ? "Jornada de 0 km detectada. Posible manipulación de odómetro o jornada fantasma." 
                : "Ruta finalizada hace más de 12h sin reporte de pago asociado.",
            'fecha' => $caja['ended_at']
        ];
    }

    // 3. Detection: Stale Routes (Rutas Huérfanas / Vencidas)
    $query_stale = "
        SELECT r.id, r.started_at, COALESCE(u.nombre, 'Chofer Desconocido') as chofer_nombre, v.placa, v.modelo
        FROM rutas r
        LEFT JOIN choferes u ON r.chofer_id = u.id
        JOIN vehiculos v ON r.vehiculo_id = v.id
        WHERE r.estado = 'activa'
        AND DATE(r.started_at) < CURDATE()
        " . ($coop_id ? "AND r.cooperativa_id = :coop_id" : "") . "
        LIMIT 50
    ";
    
    $stmtStale = $db->prepare($query_stale);
    $stmtStale->execute($coop_id ? ['coop_id' => $coop_id] : []);
    foreach ($stmtStale->fetchAll() as $stale) {
        $incidencias[] = [
            'tipo' => 'Integridad de Turno',
            'nivel' => 'alto',
            'modulo' => 'Flota/Movilidad',
            'evento' => 'Ruta Vencida (Stale)',
            'usuario' => $stale['chofer_nombre'],
            'placa' => $stale['placa'],
            'modelo' => $stale['modelo'],
            'ip' => '-',
            'descripcion' => "La unidad tiene una jornada activa iniciada en fecha: " . date('d/m/Y', strtotime($stale['started_at'])) . ". Falta reporte de cierre.",
            'fecha' => $stale['started_at']
        ];
    }
    
    // 4. Detection: Ghost Units (Inactividad Prolongada > 24h)
    // Solo auditamos inactividad si hay un chofer real asignado
    $query_ghost = "
        SELECT v.id, v.placa, v.modelo, v.chofer_id, 
               COALESCE(cho.nombre, 'Sin Chofer') as chofer_nombre, 
               (SELECT MAX(ended_at) FROM rutas WHERE vehiculo_id = v.id) as última_actividad
        FROM vehiculos v
        LEFT JOIN choferes cho ON v.chofer_id = cho.id
        WHERE v.cooperativa_id = :coop_id
        AND v.chofer_id IS NOT NULL 
        AND v.id NOT IN (
            SELECT vehiculo_id FROM rutas 
            WHERE (estado = 'activa') 
            OR (ended_at > (NOW() - INTERVAL 24 HOUR))
        )
        AND v.estado = 'activo'
        LIMIT 50
    ";
    
    $stmtGhost = $db->prepare($query_ghost);
    $stmtGhost->execute(['coop_id' => $user['cooperativa_id']]);
    foreach ($stmtGhost->fetchAll() as $ghost) {
        $last_known = $ghost['última_actividad'] ? date('d/m H:i', strtotime($ghost['última_actividad'])) : 'Sin actividad (Reset)';
        
        // Si no hay actividad previa, la "fecha" es el momento del descubrimiento (ahora)
        // en lugar de inventar un "-24 horas" que no tiene sentido tras el reset.
        $incident_date = $ghost['última_actividad'] ? $ghost['última_actividad'] : date('Y-m-d H:i:s');

        $incidencias[] = [
            'tipo' => 'Integridad de Flota',
            'nivel' => 'alto', // Elevado a ALTO para disparar Telegram automáticamente
            'modulo' => 'Recursos Humanos',
            'evento' => 'Inactividad de Personal',
            'usuario' => $ghost['chofer_nombre'],
            'placa' => $ghost['placa'],
            'modelo' => $ghost['modelo'],
            'ip' => '-',
            'descripcion' => "Chofer asignado sin reportar actividad en 24h. Última ruta: $last_known.",
            'fecha' => $incident_date
        ];
    }

    // Sort incidencias by date DESC
    usort($incidencias, function($a, $b) {
        return strtotime($b['fecha']) <=> strtotime($a['fecha']);
    });

    $critical_alerts = array_filter($incidencias, fn($i) => $i['nivel'] === 'alto' || $i['nivel'] === 'critico');

    if (!empty($critical_alerts)) {
        require_once __DIR__ . '/../system/notificaciones.php';
        foreach ($critical_alerts as $alert) {
            // BLOQUEO POR HORA PRUDENTE
            if (!$es_hora_prudente) {
                error_log("OMNI-GUARD: Notificación omitida por horario no laborable ({$alert['tipo']})");
                continue;
            }

            // Sincronizado con los roles reales detectados en la BD (dueno)
            $sqlOwner = "SELECT telegram_chat_id, cooperativa_id FROM usuarios WHERE rol = 'dueno' AND telegram_chat_id IS NOT NULL";
            if ($coop_id) $sqlOwner .= " AND cooperativa_id = :coop_id";
            
            $stmtOwner = $db->prepare($sqlOwner);
            $stmtOwner->execute($coop_id ? ['coop_id' => $coop_id] : []);
            $owners = $stmtOwner->fetchAll(PDO::FETCH_ASSOC);
            foreach ($owners as $owner) {
                $msg = "🚨 *ALERTA FORENSE:* {$alert['tipo']}\n"
                     . "📋 Evento: {$alert['evento']}\n"
                     . "👤 Chofer: {$alert['usuario']}\n"
                     . "📊 Detalle: {$alert['descripcion']}";
                sendTelegramNotification($owner['telegram_chat_id'], $msg, $owner['cooperativa_id']);
            }
        }
    }

    sendResponse([
        'incidencias' => array_slice($incidencias, 0, 50),
        'summary' => [
            'total_alerts' => count($incidencias),
            'critical_count' => count(array_filter($incidencias, fn($i) => $i['nivel'] === 'alto'))
        ]
    ]);

} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}
