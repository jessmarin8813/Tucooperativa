<?php
require_once __DIR__ . '/api/includes/db.php';
$db = DB::getInstance();
try {
    $stmt = $db->query("DESCRIBE incidencias");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
