<?php
/**
 * Driver Login API for Simulator (TuCooperativa)
 * Permite que el simulador "inicie sesión" usando solo la cédula.
 */
require_once '../includes/db.php';
require_once '../includes/middleware.php'; // For sendResponse and error handling

// Este endpoint es público para el simulador, así que NO llamamos a checkAuth()

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['cedula'])) {
    $cedula = $_GET['cedula'];
    $db = DB::getInstance();
    
    // Buscar chofer por cédula
    $stmt = $db->prepare("SELECT c.*, v.id as v_id, v.placa as vehiculo_placa, v.modelo as vehiculo_modelo 
                          FROM choferes c 
                          LEFT JOIN vehiculos v ON v.chofer_id = c.id 
                          WHERE c.cedula = ?");
    $stmt->execute([$cedula]);
    $driver = $stmt->fetch();
    
    if (!$driver) {
        sendResponse(['error' => 'Chofer no encontrado con esa cédula'], 404);
    }

    // Verificar si tiene ruta activa (Busca por chofer_id en la tabla rutas)
    $stmt_ruta = $db->prepare("SELECT * FROM rutas WHERE chofer_id = ? AND estado = 'activa' LIMIT 1");
    $stmt_ruta->execute([$driver['id']]);
    $active_route = $stmt_ruta->fetch();

    sendResponse([
        'status' => 'success',
        'driver' => [
            'telegram_id' => $driver['telegram_id'],
            'nombre' => $driver['nombre'],
            'cedula' => $driver['cedula'],
            'cooperativa_id' => $driver['cooperativa_id'],
            'vehiculo_id' => $driver['v_id'],
            'vehiculo_placa' => $driver['vehiculo_placa'],
            'active_route' => $active_route ? $active_route : null
        ]
    ]);
} else {
    sendResponse(['error' => 'Method not allowed or missing cédula'], 405);
}
