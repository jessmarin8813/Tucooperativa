<?php
/**
 * API: Forensic Audit & Fraud Detection
 * Detects: Impossible Trips, Fuel Dipping, and Odometer Tampering.
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
if ($user['rol'] !== 'superadmin') {
    sendResponse(['error' => 'Forbidden'], 403);
}

$db = DB::getInstance();

try {
    $incidencias = [];

    // 1. Detection: Impossible Trips & Fuel Dipping
    // We analyze the last 100 finalized routes
    $query = "
        SELECT 
            r.id, r.started_at, r.ended_at, r.combustible_reportado,
            u.nombre as chofer_nombre,
            c.nombre as coop_nombre,
            v.placa, v.km_por_litro as target_kpl,
            odo_ini.valor as odo_inicio,
            odo_fin.valor as odo_fin
        FROM rutas r
        JOIN usuarios u ON r.chofer_id = u.id
        JOIN cooperativas c ON r.cooperativa_id = c.id
        JOIN vehiculos v ON r.vehiculo_id = v.id
        JOIN odometros odo_ini ON r.id = odo_ini.ruta_id AND odo_ini.tipo = 'inicio'
        JOIN odometros odo_fin ON r.id = odo_fin.ruta_id AND odo_fin.tipo = 'fin'
        WHERE r.estado = 'finalizada'
        ORDER BY r.ended_at DESC
        LIMIT 100
    ";

    $stmt = $db->query($query);
    $routes = $stmt->fetchAll();

    foreach ($routes as $r) {
        $start = strtotime($r['started_at']);
        $end = strtotime($r['ended_at']);
        $duration_hours = ($end - $start) / 3600;
        $distance = (float)$r['odo_fin'] - (float)$r['odo_inicio'];
        
        // A. Impossible Trip Check (> 110 km/h average)
        if ($duration_hours > 0.1) { // Min 6 minutes to avoid noise
            $speed = $distance / $duration_hours;
            if ($speed > 110) {
                $incidencias[] = [
                    'tipo' => 'Viaje Imposible',
                    'severidad' => 'Alta',
                    'cooperativa' => $r['coop_nombre'],
                    'detalle' => "Velocidad promedio: " . round($speed, 1) . " km/h en Placa {$r['placa']}.",
                    'evidencia' => "Distancia: " . round($distance, 1) . "km en " . round($duration_hours, 2) . "h.",
                    'fecha' => $r['ended_at'],
                    'chofer' => $r['chofer_nombre']
                ];
            }
        }

        // B. Fuel Dipping Check (Discrepancy > 8 Liters)
        $targetKpl = (float)$r['target_kpl'] ?: 8.0;
        $expectedFuel = $distance / $targetKpl;
        $reportedFuel = (float)$r['combustible_reportado'];
        $diff = $reportedFuel - $expectedFuel;

        if ($diff > 8) {
            $incidencias[] = [
                'tipo' => 'Inconsistencia Dipping',
                'severidad' => 'Media',
                'cooperativa' => $r['coop_nombre'],
                'detalle' => "Diferencia de combustible: " . round($diff, 1) . " Litros.",
                'evidencia' => "Esperado: " . round($expectedFuel, 1) . "L vs Reportado: " . $reportedFuel . "L.",
                'fecha' => $r['ended_at'],
                'chofer' => $r['chofer_nombre']
            ];
        }
    }

    // 2. Detection: Odometer Tampering
    // Check if any check-in has a lower value than previous check-out for the same vehicle
    $query_odo = "
        SELECT 
            v.placa, c.nombre as coop_nombre,
            o.valor, o.tipo, o.created_at,
            u.nombre as chofer_nombre
        FROM odometros o
        JOIN rutas r ON o.ruta_id = r.id
        JOIN vehiculos v ON r.vehiculo_id = v.id
        JOIN cooperativas c ON r.cooperativa_id = c.id
        JOIN usuarios u ON r.chofer_id = u.id
        ORDER BY v.id, o.created_at ASC
        LIMIT 500
    ";

    $stmt = $db->query($query_odo);
    $odo_logs = $stmt->fetchAll();

    $last_vals = [];
    foreach ($odo_logs as $log) {
        $placa = $log['placa'];
        $val = (float)$log['valor'];

        if (isset($last_vals[$placa])) {
            if ($val < $last_vals[$placa]['valor'] && $log['tipo'] === 'inicio') {
                $incidencias[] = [
                    'tipo' => 'Odómetro Alterado',
                    'severidad' => 'Crítica',
                    'cooperativa' => $log['coop_nombre'],
                    'detalle' => "Salto negativo en odómetro detectado en Placa $placa.",
                    'evidencia' => "Anterior: " . $last_vals[$placa]['valor'] . " vs Actual: " . $val . ".",
                    'fecha' => $log['created_at'],
                    'chofer' => $log['chofer_nombre']
                ];
            }
        }
        $last_vals[$placa] = ['valor' => $val, 'at' => $log['created_at']];
    }

    // Sort incidencias by date DESC
    usort($incidencias, function($a, $b) {
        return strtotime($b['fecha']) <=> strtotime($a['fecha']);
    });

    $critical_alerts = array_filter($incidencias, fn($i) => $i['severidad'] === 'Crítica' || $i['severidad'] === 'Alta');

    if (!empty($critical_alerts)) {
        require_once __DIR__ . '/../notificaciones.php';
        
        // Find owners of this cooperativa to notify
        // For now, simplify to notify all owners of the coops involved in alerts
        foreach ($critical_alerts as $alert) {
            $stmtOwner = $db->prepare("SELECT telegram_chat_id, cooperativa_id FROM usuarios WHERE rol = 'owner' AND telegram_chat_id IS NOT NULL");
            $stmtOwner->execute();
            $owners = $stmtOwner->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($owners as $owner) {
                $msg = "🚨 *ALERTA FORENSE:* {$alert['tipo']}\n"
                     . "📍 Unidad: {$alert['detalle']}\n"
                     . "👤 Chofer: {$alert['chofer']}\n"
                     . "📊 Evidencia: {$alert['evidencia']}";
                sendTelegramNotification($owner['telegram_chat_id'], $msg, $owner['cooperativa_id']);
            }
        }
    }

    sendResponse([
        'incidencias' => array_slice($incidencias, 0, 50), // Return top 50
        'summary' => [
            'total_alerts' => count($incidencias),
            'critical_count' => count(array_filter($incidencias, fn($i) => $i['severidad'] === 'Crítica'))
        ]
    ]);

} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}
