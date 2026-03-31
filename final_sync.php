<?php
require_once 'api/includes/db.php';
require_once 'api/includes/bcv_helper.php';

$db = DB::getInstance();
echo "--- Ejecutando Limpieza de Tasa Obsoleta ---\n";
$db->exec("DELETE FROM tasas_cambio WHERE fecha = '2026-03-31'");

echo "--- Sincronizando con 'Extracción Directa' (OMNI-GUARD v6.7) ---\n";
$rate = get_bcv_rate();

echo "\n💥 TASA ACTUALIZADA: " . $rate . " Bs/$\n";
echo "--- Detalle de BD ---\n";
$stmt = $db->query("SELECT * FROM tasas_cambio ORDER BY created_at DESC LIMIT 1");
print_r($stmt->fetch(PDO::FETCH_ASSOC));
?>
