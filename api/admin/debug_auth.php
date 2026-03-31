<?php
require_once __DIR__ . '/../includes/middleware.php';
try {
    $user = checkAuth();
    echo json_encode(["status" => "AUTH OK", "user" => $user]);
} catch (Throwable $e) {
    echo json_encode(["status" => "AUTH FAIL", "error" => $e->getMessage()]);
}
