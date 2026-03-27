<?php
require_once 'api/includes/db.php';
try {
    $db = DB::getInstance();
    $res = $db->query("SELECT id, nombre, rol, username, pago_info FROM usuarios")->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($res, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
