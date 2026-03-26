<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();
try {
    $db->beginTransaction();
    
    // Update existing users
    $stmt = $db->prepare("UPDATE usuarios SET rol = 'dueno' WHERE rol = 'admin'");
    $stmt->execute();
    $updated = $stmt->rowCount();
    
    $db->commit();
    echo json_encode(["success" => true, "updated_users" => $updated]);
} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
