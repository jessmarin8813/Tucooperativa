<?php
/**
 * API: Driver Ranking & Gamification
 * Calculates scores based on efficiency, punctuality, and safety.
 */
require_once __DIR__ . '/../includes/middleware.php';
$user = checkAuth();
$coopId = $user['cooperativa_id'];

$db = DB::getInstance();

try {
    // 1. Get Ranking Data
    $query = "
        SELECT 
            u.id as chofer_id,
            u.nombre,
            COUNT(r.id) as total_rutas,
            SUM(CASE WHEN r.alerta_combustible = 1 THEN 1 ELSE 0 END) as total_alertas,
            SUM(r.combustible) as total_fuel,
            SUM(IFNULL(odo_fin.valor, 0) - IFNULL(odo_ini.valor, 0)) as total_distance,
            AVG(CASE WHEN r.ended_at IS NOT NULL AND TIMESTAMPDIFF(HOUR, r.started_at, r.ended_at) <= 12 THEN 100 ELSE 0 END) as score_punctuality,
            MAX(v.km_por_litro) as target_kpl
        FROM usuarios u
        LEFT JOIN rutas r ON u.id = r.chofer_id AND r.estado = 'finalizada'
        LEFT JOIN vehiculos v ON r.vehiculo_id = v.id
        LEFT JOIN odometros odo_ini ON r.id = odo_ini.ruta_id AND odo_ini.tipo = 'inicio'
        LEFT JOIN odometros odo_fin ON r.id = odo_fin.ruta_id AND odo_fin.tipo = 'fin'
        WHERE u.rol = 'chofer' AND u.cooperativa_id = ?
        GROUP BY u.id, u.nombre
    ";

    $stmt = $db->prepare($query);
    $stmt->execute([$coopId]);
    $drivers = $stmt->fetchAll();

    $ranking = [];
    foreach ($drivers as $d) {
        $fuel = (float)$d['total_fuel'];
        $dist = (float)$d['total_distance'];
        $target = (float)$d['target_kpl'] ?: 8.0;
        
        // Global Score
        // 1. Efficiency (30%)
        $realKpl = $fuel > 0 ? $dist / $fuel : 0;
        $scoreEfficiency = $realKpl > 0 ? min(100, ($realKpl / $target) * 100) : 0;

        // 2. Punctuality (30%) - Based on route completion
        $scorePunctuality = (float)$d['score_punctuality'];

        // 3. Safety (20%)
        $scoreSafety = max(0, 100 - ($d['total_alertas'] * 25));

        // 4. Solvency (20%) [NEW]: Based on payments
        $sql_solv = "SELECT 
            (SELECT COUNT(*) FROM pagos_reportados WHERE chofer_id = ? AND estado = 'aprobado') as ok,
            (SELECT COUNT(*) FROM pagos_reportados WHERE chofer_id = ? AND estado = 'rechazado') as bad";
        $stmt_s = $db->prepare($sql_solv);
        $stmt_s->execute([$d['chofer_id'], $d['chofer_id']]);
        $solv = $stmt_s->fetch();
        $total_p = $solv['ok'] + $solv['bad'];
        $scoreSolvency = $total_p > 0 ? ($solv['ok'] / $total_p) * 100 : 100; // Default 100 if no payments yet

        $globalScore = ($scoreEfficiency * 0.3) + ($scorePunctuality * 0.3) + ($scoreSafety * 0.2) + ($scoreSolvency * 0.2);

        $ranking[] = [
            'id' => $d['chofer_id'],
            'nombre' => $d['nombre'],
            'stats' => [
                'distancia' => round($dist, 2),
                'combustible' => round($fuel, 2),
                'kpl' => round($realKpl, 2),
                'alertas' => (int)$d['total_alertas'],
                'eficiencia' => round($scoreEfficiency, 1),
                'puntualidad' => round($scorePunctuality, 1),
                'seguridad' => round($scoreSafety, 1)
            ],
            'puntos' => round($globalScore, 1)
        ];
    }

    // Sort by global score DESC
    usort($ranking, function($a, $b) {
        return $b['puntos'] <=> $a['puntos'];
    });

    // Add rank and medallas
    foreach ($ranking as $index => &$r) {
        $r['rango'] = $index + 1;
        if ($index === 0) $r['medalla'] = 'oro';
        elseif ($index === 1) $r['medalla'] = 'plata';
        elseif ($index === 2) $r['medalla'] = 'bronce';
        else $r['medalla'] = 'ninguna';
    }

    sendResponse([
        'ranking' => $ranking,
        'summary' => [
            'total_drivers' => count($ranking),
            'avg_score' => count($ranking) > 0 ? array_sum(array_column($ranking, 'puntos')) / count($ranking) : 0
        ]
    ]);

} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}
