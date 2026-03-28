<?php
$db = new PDO('mysql:host=localhost;dbname=tu_cooperativa', 'root', '');
echo "--- VEHICULOS ---\n";
foreach($db->query('DESCRIBE vehiculos') as $row) {
    echo "{$row['Field']} ({$row['Type']})\n";
}
echo "\n--- USUARIOS ---\n";
foreach($db->query('DESCRIBE usuarios') as $row) {
    echo "{$row['Field']} ({$row['Type']})\n";
}
echo "\n--- CHOFERES ---\n";
foreach($db->query('DESCRIBE choferes') as $row) {
    echo "{$row['Field']} ({$row['Type']})\n";
}
