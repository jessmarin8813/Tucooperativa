<?php
require_once 'api/includes/db.php';
require_once 'api/includes/bcv_helper.php';

$db = DB::getInstance();

echo "--- Current Table Content ---\n";
$stmt = $db->query("SELECT * FROM tasas_cambio ORDER BY created_at DESC");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $row) {
    echo "ID: {$row['id']} | Moneda: {$row['moneda']} | Tasa: {$row['tasa']} | Fecha: {$row['fecha']} | Creado: {$row['created_at']}\n";
}

echo "\n--- Schema ---\n";
$stmt = $db->query("SHOW CREATE TABLE tasas_cambio");
$schema = $stmt->fetch(PDO::FETCH_ASSOC);
echo $schema['Create Table'] . "\n";

echo "\n--- Direct API Check ---\n";
$url = "https://ve.dolarapi.com/v1/dolares/oficial";
$resp = file_get_contents($url);
echo "Raw Response: " . $resp . "\n";

echo "\n--- Helper Call ---\n";
$rate = get_bcv_rate();
echo "Helper returned: " . $rate . "\n";
?>
