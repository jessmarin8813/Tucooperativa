<?php
/**
 * Session Verification Endpoint
 */
require_once 'includes/db.php';
require_once 'includes/middleware.php';

// checkAuth in middleware.php already handles session_start() 
// and returns user data or exits with 401.
try {
    $user = checkAuth();
    sendResponse([
        'isLoggedIn' => true,
        'user' => $user
    ]);
} catch (Exception $e) {
    sendResponse(['isLoggedIn' => false, 'error' => $e->getMessage()], 401);
}
?>
