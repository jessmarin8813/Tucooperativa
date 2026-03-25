<?php
/**
 * Login Endpoint
 */
require_once __DIR__ . '/includes/db.php';

session_start();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and password are required']);
    exit;
}

$db = DB::getInstance();
$stmt = $db->prepare("SELECT id, cooperativa_id, nombre, password_hash, rol FROM usuarios WHERE username = :un");
$stmt->execute(['un' => $username]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password_hash'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['cooperativa_id'] = $user['cooperativa_id'];
    $_SESSION['nombre'] = $user['nombre'];
    $_SESSION['rol'] = $user['rol'];

    echo json_encode([
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'nombre' => $user['nombre'],
            'rol' => $user['rol'],
            'cooperativa_id' => $user['cooperativa_id']
        ]
    ]);
} else {
    error_log("Login failed for user: " . $username);
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials', 'debug_hint' => 'Check if username exists and password matches admin123']);
}
