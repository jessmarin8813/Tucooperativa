<?php
/**
 * Multi-tenancy & Auth Middleware
 */
require_once __DIR__ . '/db.php';

session_start();

// Global JSON Error Handling
set_exception_handler(function($e) {
    header('Content-Type: application/json', true, 500);
    echo json_encode([
        'error' => 'Server Error',
        'message' => $e->getMessage()
    ]);
    exit;
});

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) return;
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

function checkAuth() {
    if (!isset($_SESSION['user_id'])) {
        header('Content-Type: application/json', true, 401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    return [
        'user_id' => $_SESSION['user_id'],
        'cooperativa_id' => $_SESSION['cooperativa_id'] ?? null,
        'rol' => $_SESSION['rol'],
        'nombre' => $_SESSION['nombre']
    ];
}

function sendResponse($data, $code = 200) {
    header('Content-Type: application/json', true, $code);
    echo json_encode($data);
    exit;
}
?>
