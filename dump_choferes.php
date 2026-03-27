<?php
require_once 'api/includes/db.php';
try {
    $db = DB::getInstance();
    $res = $db->query("SELECT id, nombre, telegram_id, vehiculo_id FROM choferes")->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($res, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
