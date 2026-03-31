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
    // throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
    error_log("PHP Warning: $errstr in $errfile on line $errline");
});

if (!function_exists('checkAuth')) {
    function checkAuth($shouldExit = true) {
        // 1. Prioritize Web Session
        if (isset($_SESSION['user_id'])) {
            $tid = $_SESSION['telegram_chat_id'] ?? null;
            
            // Real-time update check if not in session
            if (!$tid) {
                $db = DB::getInstance();
                $stmt = $db->prepare("SELECT telegram_chat_id FROM usuarios WHERE id = ?");
                $stmt->execute([$_SESSION['user_id']]);
                $tid = $stmt->fetchColumn();
                $_SESSION['telegram_chat_id'] = $tid;
            }

            return [
                'user_id' => $_SESSION['user_id'],
                'cooperativa_id' => $_SESSION['cooperativa_id'] ?? null,
                'rol' => $_SESSION['rol'],
                'nombre' => $_SESSION['nombre'],
                'telegram_chat_id' => $tid
            ];
        }


        // 2. Fallback to Telegram ID (Bot or Simulator)
        // We look in JSON body or GET
        $input = json_decode(file_get_contents('php://input'), true);
        $tid = $input['telegram_id'] ?? $_GET['telegram_id'] ?? null;

        if ($tid) {
            $db = DB::getInstance();
            // 1. Check in Usuarios (Owners/Admins)
            $stmt = $db->prepare("SELECT id, cooperativa_id, rol, nombre FROM usuarios WHERE telegram_chat_id = ? OR telegram_id = ?");
            $stmt->execute([$tid, $tid]);
            $user = $stmt->fetch();
            
            if ($user && $user['id']) {
                return [
                    'user_id' => $user['id'],
                    'cooperativa_id' => $user['cooperativa_id'],
                    'rol' => $user['rol'],
                    'nombre' => $user['nombre'],
                    'telegram_chat_id' => $tid
                ];
            }

            // 2. Check in Choferes (New driver table)
            $stmt = $db->prepare("SELECT id, cooperativa_id, nombre FROM choferes WHERE telegram_id = ?");
            $stmt->execute([$tid]);
            $chofer = $stmt->fetch();

            if ($chofer && $chofer['id']) {
                return [
                    'user_id' => $chofer['id'],
                    'cooperativa_id' => $chofer['cooperativa_id'],
                    'rol' => 'chofer', // Hardcoded as they are in the choferes table
                    'nombre' => $chofer['nombre']
                ];
            }
        }

        if (!$shouldExit) return false;

        header('Content-Type: application/json', true, 401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

if (!function_exists('sendResponse')) {
    function sendResponse($data, $code = 200) {
        header('Content-Type: application/json', true, $code);
        echo json_encode($data);
        exit;
    }
}
