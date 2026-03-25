<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

echo "DEBUG START\n";
require_once 'api/includes/db.php';
require_once 'api/includes/middleware.php';

// Simulate Session
session_start();
$_SESSION['user_id'] = 1;
$_SESSION['rol'] = 'admin';
$_SESSION['cooperativa_id'] = 1;

try {
    echo "INCLUDING audit_forensic.php...\n";
    include 'api/admin/audit_forensic.php';
    echo "\nAUDIT_FORENSIC DONE\n";
} catch (Throwable $e) {
    echo "\nFATAL ERROR (audit_forensic): " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n";
}

try {
    echo "\nINCLUDING get_config.php...\n";
    include 'api/admin/get_config.php';
    echo "\nGET_CONFIG DONE\n";
} catch (Throwable $e) {
    echo "\nFATAL ERROR (get_config): " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n";
}
?>
