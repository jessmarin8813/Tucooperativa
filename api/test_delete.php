<?php
require_once __DIR__ . '/includes/DB.php';
$db = DB::getInstance();
$vid = $_GET['id'] ?? null;
if (!$vid) die("Pasar ID");

try {
    $db->beginTransaction();
    $db->prepare("DELETE FROM vehiculos WHERE id = ?")->execute([$vid]);
    $db->rollBack();
    echo "SUCCESS (Dry run)";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
