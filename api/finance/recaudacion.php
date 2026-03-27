<?php
/**
 * Collection & Reconciliation API (Recaudación)
 */
require_once '../includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();
$coop_id = $user['cooperativa_id'];

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $fecha = $_GET['fecha'] ?? date('Y-m-d');
        
        // List daily payments with vehicle and driver details
        $stmt = $db->prepare("SELECT p.*, v.placa, u.nombre as chofer_nombre,
                             (p.monto_efectivo + p.monto_pagomovil) as total_recibido,
                             (p.monto - (p.monto_efectivo + p.monto_pagomovil)) as saldo
                             FROM pagos_diarios p
                             JOIN vehiculos v ON p.vehiculo_id = v.id
                             JOIN choferes u ON p.chofer_id = u.id
                             WHERE p.cooperativa_id = :coop_id AND p.fecha = :fecha
                             ORDER BY p.estado DESC, p.created_at ASC");
        $stmt->execute(['coop_id' => $coop_id, 'fecha' => $fecha]);
        sendResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';

        if ($action === 'confirm_payment') {
            $pago_id = $data['pago_id'] ?? null;
            if (!$pago_id) sendResponse(['error' => 'ID de pago requerido'], 400);

            $stmt = $db->prepare("UPDATE pagos_diarios SET estado = 'pagado' 
                                 WHERE id = :id AND cooperativa_id = :coop_id");
            $stmt->execute(['id' => $pago_id, 'coop_id' => $coop_id]);
            
            sendResponse(['message' => 'Pago conciliado exitosamente']);
        } else {
            sendResponse(['error' => 'Acción inválida'], 400);
        }
        break;

    default:
        sendResponse(['error' => 'Método no permitido'], 405);
        break;
}
