<?php
/**
 * API: Get BCV Exchange Rate
 * Path: api/admin/get_rate.php
 */
require_once __DIR__ . '/../includes/middleware.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/bcv_helper.php';

$auth = checkAuth(); // Ensure logged in

$rate = get_bcv_rate();

sendResponse([
    'status' => 'success',
    'rate' => $rate,
    'currency' => 'USD/Bs',
    'date' => date('Y-m-d')
]);
?>
