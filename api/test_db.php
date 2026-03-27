<?php
require_once 'includes/db.php';
header('Content-Type: application/json');
try {
    $db = DB::getInstance();
    $stmt = $db->query("SELECT 1");
    echo json_encode(['status' => 'ok', 'db' => 'connected']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
