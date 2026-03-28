<?php
$db = new PDO('mysql:host=localhost;dbname=tu_cooperativa', 'root', '');
echo "--- INCIDENCIAS ---\n";
foreach($db->query('DESCRIBE incidencias') as $row) { echo "{$row['Field']} ({$row['Type']})\n"; }
echo "\n--- GASTOS ---\n";
foreach($db->query('DESCRIBE gastos') as $row) { echo "{$row['Field']} ({$row['Type']})\n"; }
echo "\n--- TASAS ---\n";
foreach($db->query('DESCRIBE tasas_cambio') as $row) { echo "{$row['Field']} ({$row['Type']})\n"; }
