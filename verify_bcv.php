<?php
require_once __DIR__ . '/api/includes/db.php';
require_once __DIR__ . '/api/includes/bcv_helper.php';

echo "Tasa desde get_bcv_rate(): " . get_bcv_rate() . "\n";

$db = DB::getInstance();
$last = $db->query("SELECT * FROM tasas_cambio ORDER BY created_at DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
echo "Último registro en DB:\n";
print_r($last);
?>
