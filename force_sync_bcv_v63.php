<?php
require_once 'api/includes/db.php';
require_once 'api/includes/bcv_helper.php';

$db = DB::getInstance();
echo "Limpiando tasa del 2026-03-31...\n";
$db->exec("DELETE FROM tasas_cambio WHERE fecha = '2026-03-31'");

echo "Sincronizando con Resiliencia (v6.3)...\n";
$rate = get_bcv_rate();

echo "RESULTADO FINAL: " . $rate . "\n";
echo "--- Verificación en BD ---\n";
$stmt = $db->query("SELECT * FROM tasas_cambio ORDER BY created_at DESC LIMIT 1");
print_r($stmt->fetch(PDO::FETCH_ASSOC));
?>
