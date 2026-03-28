<?php
/**
 * Manual Force Sync: BCV Rate 471.70
 */
require_once 'api/includes/db.php';
$db = DB::getInstance();
$today = date('Y-m-d');
$rate = 471.70;

try {
    // Insert for Monday 30th (as seen in the screenshot)
    $stmt = $db->prepare("INSERT INTO tasas_cambio (moneda, tasa, fecha, fuente) VALUES ('USD', ?, '2026-03-30', 'BCV') ON DUPLICATE KEY UPDATE tasa = ?");
    $stmt->execute([$rate, $rate]);
    echo "OK: Rate forced to 471.70 for Monday 30th\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
