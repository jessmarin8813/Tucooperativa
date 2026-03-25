<?php
// Silencio total para evitar "headers already sent"
error_reporting(E_ALL);
ini_set('display_errors', 0); // No mostrar en pantalla, capturaremos el buffer

session_start();
$_SESSION['user_id'] = 1;
$_SESSION['rol'] = 'admin';
$_SESSION['cooperativa_id'] = 1;
$_SESSION['nombre'] = 'Admin Debug';

ob_start();
include 'api/admin/audit_forensic.php';
$output = ob_get_clean();

file_put_contents('debug_output.json', $output);
?>
