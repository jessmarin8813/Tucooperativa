<?php
/**
 * Diagnostic Script for api/fleet/rutas.php
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Simulate the environment
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer dummy'; // We might need to bypass auth for testing or look at logs

function test_api() {
    // Capture output
    ob_start();
    
    // We need to simulate the input stream
    // This is tricky in CLI, but we can override php://input if we use a helper
    // For now, let's just include it and see if it fails at the start (includes)
    
    try {
        require_once __DIR__ . '/api/fleet/rutas.php';
    } catch (Throwable $e) {
        echo "\n[CATCHED ERROR] " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n";
    }
    
    $output = ob_get_clean();
    echo "--- OUTPUT ---\n$output\n--- END ---";
}

test_api();
?>
