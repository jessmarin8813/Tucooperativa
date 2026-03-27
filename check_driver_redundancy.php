<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();
$stmt = $db->query("SELECT rol, COUNT(*) as count FROM usuarios GROUP BY rol");
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "ROLES IN USUARIOS TABLE:\n";
foreach ($results as $r) {
    echo "- {$r['rol']}: {$r['count']}\n";
}

$stmt = $db->query("SELECT COUNT(*) as count FROM choferes");
echo "TOTAL IN CHOFERES TABLE: " . $stmt->fetch()['count'] . "\n";
?>
