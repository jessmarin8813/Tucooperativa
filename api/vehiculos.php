<?php
/**
 * Vehicles Management (Multi-tenant + Real-time Status)
 */
require_once __DIR__ . '/includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();
$coop_id = $user['cooperativa_id'] ?? 1;

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // New: Support for Bot lookup via driver session
        if (isset($_GET['my_unit'])) {
            $stmt = $db->prepare("SELECT v.*, u.nombre as dueno_nombre 
                                 FROM vehiculos v 
                                 JOIN usuarios u ON v.dueno_id = u.id 
                                 JOIN rutas r ON r.vehiculo_id = v.id
                                 WHERE r.chofer_id = :user_id AND r.estado = 'activa'
                                 LIMIT 1");
            $stmt->execute(['user_id' => $user['user_id']]);
            $v = $stmt->fetch();
            if ($v) {
                $v['status_label'] = 'en ruta';
                sendResponse($v);
            } else {
                sendResponse(['error' => 'No tienes una unidad asignada en ruta activa'], 404);
            }
            exit;
        }

        // List vehicles with current driver and active route status
        $sql = "SELECT v.*, u.nombre as dueno_nombre,
                (SELECT r.estado FROM rutas r WHERE r.vehiculo_id = v.id AND r.estado = 'activa' LIMIT 1) as current_status,
                (SELECT u2.nombre FROM rutas r JOIN usuarios u2 ON r.chofer_id = u2.id WHERE r.vehiculo_id = v.id AND r.estado = 'activa' LIMIT 1) as chofer_nombre
                FROM vehiculos v 
                LEFT JOIN usuarios u ON v.dueno_id = u.id 
                WHERE v.cooperativa_id = :coop_id";
        
        $stmt = $db->prepare($sql);
        $stmt->execute(['coop_id' => $coop_id]);
        $vehicles = $stmt->fetchAll();

        // Map status to readable format
        foreach ($vehicles as &$v) {
            $v['status_label'] = ($v['current_status'] ?? '') === 'activa' ? 'en ruta' : 'activo';
        }

        sendResponse($vehicles);
        break;

    case 'POST':
        if ($user['rol'] !== 'admin' && $user['rol'] !== 'dueno') {
            sendResponse(['error' => 'Permission denied'], 403);
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $placa = strtoupper($data['placa'] ?? '');
        $modelo = $data['modelo'] ?? '';
        $anio = $data['anio'] ?? date('Y');
        $cuota = $data['cuota_diaria'] ?? 0;
        $km_l = $data['km_por_litro'] ?? 8.00;
        $dueno_id = $data['dueno_id'] ?? $user['user_id'];

        try {
            $stmt = $db->prepare("INSERT INTO vehiculos (cooperativa_id, dueno_id, placa, modelo, anio, cuota_diaria, km_por_litro) 
                                 VALUES (:coop_id, :dueno_id, :placa, :modelo, :anio, :cuota, :km_l)");
            $stmt->execute([
                'coop_id' => $coop_id,
                'dueno_id' => $dueno_id,
                'placa' => $placa,
                'modelo' => $modelo,
                'anio' => $anio,
                'cuota' => $cuota,
                'km_l' => $km_l
            ]);
            sendResponse(['message' => 'Vehículo registrado exitosamente', 'id' => $db->lastInsertId()]);
        } catch (PDOException $e) {
            sendResponse(['error' => 'Error al registrar: ' . $e->getMessage()], 500);
        }
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
        break;
}
?>
