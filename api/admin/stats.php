<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/middleware.php';

$auth = checkAuth();
if ($auth['rol'] !== 'superadmin') {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied. SuperAdmin role required.']);
    exit;
}

$db = DB::getInstance();

// Estadísticas Globales
$stats = [
    'total_cooperativas' => $db->query("SELECT COUNT(*) FROM cooperativas")->fetchColumn(),
    'total_vehiculos' => $db->query("SELECT COUNT(*) FROM vehiculos")->fetchColumn(),
    'total_rutas_activas' => $db->query("SELECT COUNT(*) FROM rutas WHERE estado = 'activa'")->fetchColumn(),
    'recaudacion_total' => $db->query("SELECT SUM(monto) FROM pagos_diarios")->fetchColumn() ?? 0
];

header('Content-Type: application/json');
echo json_encode($stats);
