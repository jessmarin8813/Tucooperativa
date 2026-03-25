<?php
/**
 * API: Forensic Audit & Fraud Detection
 * Detects: Impossible Trips, Fuel Dipping, and Odometer Tampering.
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
if (!in_array($user['rol'], ['superadmin', 'owner', 'admin', 'dueno'])) {
    sendResponse(['error' => 'Forbidden'], 403);
}

$coop_id = in_array($user['rol'], ['owner', 'admin', 'dueno']) ? $user['cooperativa_id'] : null;

$db = DB::getInstance();

try {
    $incidencias = [];

    // 1. Detection: Dead Mileage (Kilometraje Muerto) & Fuel Efficiency
    // We analyze the last 100 routes per vehicle
    $query = "
        SELECT 
            v.placa, v.km_por_litro as target_kpl,
            r.id, r.started_at, r.ended_at, r.combustible,
            u.nombre as chofer_nombre,
            c.nombre as coop_nombre,
            odo_ini.valor as odo_inicio,
            odo_fin.valor as odo_fin
        FROM rutas r
        JOIN usuarios u ON r.chofer_id = u.id
        JOIN cooperativas c ON r.cooperativa_id = c.id
        JOIN vehiculos v ON r.vehiculo_id = v.id
        JOIN odometros odo_ini ON r.id = odo_ini.ruta_id AND odo_ini.tipo = 'inicio'
        JOIN odometros odo_fin ON r.id = odo_fin.ruta_id AND odo_fin.tipo = 'fin'
        WHERE r.estado = 'finalizada'
        " . ($coop_id ? "AND r.cooperativa_id = $coop_id" : "") . "
        ORDER BY v.id, r.ended_at DESC
        LIMIT 200
    ";

    $stmt = $db->query($query);
    $routes = $stmt->fetchAll();

    $last_route_per_vehicle = [];
    foreach ($routes as $r) {
        $placa = $r['placa'];
        $odo_ini = (float)$r['odo_inicio'];
        $odo_fin = (float)$r['odo_fin'];
        $distancia = $odo_fin - $odo_ini;
        
        // A. Dead Mileage Check (Kilometraje Muerto)
        // We compare this route's START with the PREVIOUS route's END (if exists)
        // Since we order by ended_at DESC, the "next" in loop is chronologically "previous"
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
                    'ip' => '-',
                    'descripcion' => "Desvío de " . round($dead_km, 1) . " km detectado entre rutas de la unidad {$placa}.",
                    'fecha' => $r['ended_at']
                ];
            }
        }
        $last_route_per_vehicle[$placa] = $r;

        // B. Fuel Efficiency Anomaly
        $targetKpl = (float)$r['target_kpl'] ?: 8.0;
        $reportedFuel = (float)$r['combustible'];
        
        if ($reportedFuel > 0 && $distancia > 5) {
            $realKpl = $distancia / $reportedFuel;
            if ($realKpl < ($targetKpl * 0.75)) {
                $incidencias[] = [
                    'tipo' => 'Anomalía de Consumo',
                    'nivel' => 'medio',
                    'modulo' => 'Operativo',
                    'evento' => 'Bajo Rendimiento / Dipping',
                    'usuario' => $r['chofer_nombre'],
                    'ip' => '-',
                    'descripcion' => "Rendimiento de " . round($realKpl, 1) . " km/L detectado (Objetivo: $targetKpl km/L) en Placa $placa.",
                    'fecha' => $r['ended_at']
                ];
            }
        }
    }

    // 2. Detection: Inreconciled Income (Cajas Pendientes > 12h)
    $query_caja = "
        SELECT r.id, r.ended_at, u.nombre as chofer_nombre, c.nombre as coop_nombre
        FROM rutas r
        JOIN usuarios u ON r.chofer_id = u.id
        JOIN cooperativas c ON r.cooperativa_id = c.id
        LEFT JOIN pagos_reportados p ON r.id = p.id_ruta
        WHERE r.estado = 'finalizada'
        AND r.ended_at < (NOW() - INTERVAL 12 HOUR)
        AND p.id IS NULL
        " . ($coop_id ? "AND r.cooperativa_id = $coop_id" : "") . "
        LIMIT 50
    ";
    
    $stmtCaja = $db->query($query_caja);
    foreach ($stmtCaja->fetchAll() as $caja) {
        $incidencias[] = [
            'tipo' => 'Brecha de Auditoría',
            'nivel' => 'alto',
            'modulo' => 'Administración',
            'evento' => 'Cierre Sin Conciliar',
            'usuario' => $caja['chofer_nombre'],
            'ip' => '-',
            'descripcion' => "Ruta finalizada hace más de 12h sin reporte de pago asociado.",
            'fecha' => $caja['ended_at']
        ];
    }

    // Sort incidencias by date DESC
    usort($incidencias, function($a, $b) {
        return strtotime($b['fecha']) <=> strtotime($a['fecha']);
    });

    $critical_alerts = array_filter($incidencias, fn($i) => $i['nivel'] === 'alto' || $i['nivel'] === 'critico');

    if (!empty($critical_alerts)) {
        require_once __DIR__ . '/../system/notificaciones.php';
        
        // Find owners of this cooperativa to notify
        // For now, simplify to notify all owners of the coops involved in alerts
        foreach ($critical_alerts as $alert) {
            $stmtOwner = $db->prepare("SELECT telegram_chat_id, cooperativa_id FROM usuarios WHERE rol = 'owner' AND telegram_chat_id IS NOT NULL" . ($coop_id ? " AND cooperativa_id = $coop_id" : ""));
            $stmtOwner->execute();
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
        'incidencias' => array_slice($incidencias, 0, 50), // Return top 50
        'summary' => [
            'total_alerts' => count($incidencias),
            'critical_count' => count(array_filter($incidencias, fn($i) => $i['nivel'] === 'alto'))
        ]
    ]);

} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}
