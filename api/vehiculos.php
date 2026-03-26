<?php
/**
 * Vehicles Management (Multi-tenant)
 */
require_once __DIR__ . '/includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();
$coop_id = $user['cooperativa_id'] ?? 1;

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // List vehicles for this cooperative only
        $stmt = $db->prepare("SELECT v.*, u.nombre as dueno_nombre 
                             FROM vehiculos v 
                             JOIN usuarios u ON v.dueno_id = u.id 
                             WHERE v.cooperativa_id = :coop_id");
        $stmt->execute(['coop_id' => $coop_id]);
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        // Create new vehicle (RBAC: Admin or Dueno)
        if ($user['rol'] !== 'admin' && $user['rol'] !== 'dueno') {
            http_response_code(403);
            echo json_encode(['error' => 'Permission denied']);
            break;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $placa = $data['placa'] ?? '';
        $modelo = $data['modelo'] ?? '';
        $anio = $data['anio'] ?? '';
        $cuota = $data['cuota_diaria'] ?? 0;
        $dueno_id = $data['dueno_id'] ?? $user['user_id'];

        try {
            $stmt = $db->prepare("INSERT INTO vehiculos (cooperativa_id, dueno_id, placa, modelo, anio, cuota_diaria) 
                                 VALUES (:coop_id, :dueno_id, :placa, :modelo, :anio, :cuota)");
            $stmt->execute([
                'coop_id' => $coop_id,
                'dueno_id' => $dueno_id,
                'placa' => $placa,
                'modelo' => $modelo,
                'anio' => $anio,
                'cuota' => $cuota
            ]);
            echo json_encode(['message' => 'Vehicle created', 'id' => $db->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Creation failed: ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
