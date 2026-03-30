<?php
/**
 * Session Verification Endpoint
 */
require_once '../includes/db.php';
require_once '../includes/middleware.php';

// checkAuth in middleware.php already handles session_start() 
// and returns user data or exits with 401.
try {
    $user = checkAuth(false);
    if ($user) {
        sendResponse([
            'isLoggedIn' => true,
            'user' => $user
        ]);
    } else {
        // Safe to return 200 OK for initial session check to keep console clean
        sendResponse(['isLoggedIn' => false]);
    }
} catch (Exception $e) {
    sendResponse(['isLoggedIn' => false, 'error' => $e->getMessage()]);
}
?>
