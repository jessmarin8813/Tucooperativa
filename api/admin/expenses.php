<?php
/**
 * API: Fleet Expenses Management
 * Path: api/admin/expenses.php
 */
require_once __DIR__ . '/../includes/middleware.php';
require_once __DIR__ . '/../includes/db.php';

$db = DB::getInstance();
$method = $_SERVER['REQUEST_METHOD'];
$cooperativa_id = $_SESSION['cooperativa_id'];

if ($method === 'GET') {
    // List expenses
    $query = "SELECT g.*, v.placa 
              FROM gastos g 
              LEFT JOIN vehiculos v ON g.vehiculo_id = v.id 
              WHERE g.cooperativa_id = :cid 
              ORDER BY g.fecha DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute(['cid' => $cooperativa_id]);
    $expenses = $stmt->fetchAll();
    
    sendResponse(['expenses' => $expenses]);
} 

if ($method === 'POST') {
    // Add new expense
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['monto']) || empty($data['fecha']) || empty($data['categoria'])) {
        sendResponse(['error' => 'Monto, fecha y categoría son obligatorios'], 400);
    }
    
    $query = "INSERT INTO gastos (cooperativa_id, vehiculo_id, categoria, monto, descripcion, fecha) 
              VALUES (:cid, :vid, :cat, :monto, :desc, :fecha)";
    
    $stmt = $db->prepare($query);
    $stmt->execute([
        'cid' => $cooperativa_id,
        'vid' => !empty($data['vehiculo_id']) ? $data['vehiculo_id'] : null,
        'cat' => $data['categoria'],
        'monto' => $data['monto'],
        'desc' => !empty($data['descripcion']) ? $data['descripcion'] : '',
        'fecha' => $data['fecha']
    ]);
    
    sendResponse(['success' => true, 'id' => $db->lastInsertId()]);
}

sendResponse(['error' => 'Method not allowed'], 405);
