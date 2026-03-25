<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();

echo "Running FORCE-MIGRATION...\n";
$db->query("ALTER TABLE vehiculos ADD COLUMN km_por_litro DECIMAL(10,2) DEFAULT 8.00 AFTER placa");
echo "Column km_por_litro added.\n";
$db->query("ALTER TABLE vehiculos ADD COLUMN cuota_diaria DECIMAL(10,2) DEFAULT 0 AFTER km_por_litro");
echo "Column cuota_diaria added.\n";
$db->query("ALTER TABLE vehiculos ADD COLUMN modelo VARCHAR(100) AFTER cuota_diaria");
echo "Column modelo added.\n";
$db->query("ALTER TABLE vehiculos ADD COLUMN anio INT AFTER modelo");
echo "Column anio added.\n";

echo "SUCCESS: Schema synchronized.\n";
