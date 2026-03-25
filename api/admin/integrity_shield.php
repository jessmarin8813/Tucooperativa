<?php
/**
 * API: Integrity Shield (Remote Audit)
 * Path: api/admin/integrity_shield.php
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
if (!in_array($user['rol'], ['superadmin', 'owner', 'admin', 'dueno'])) {
    sendResponse(['error' => 'Forbidden'], 403);
}

// Define check function if not defined (to allow including integrity_audit logic)
if (!function_exists('check')) {
    global $report;
    $report = ["status" => "PASS", "checks" => []];
    function check($name, $callback, $errorMessage) {
        global $report;
        $status = "PASS";
        $message = "OK";
        try {
            if (!$callback()) {
                $status = "FAIL";
                $message = $errorMessage;
                $report["status"] = "FAIL";
            }
        } catch (Exception $e) {
            $status = "FAIL";
            $message = "Exception: " . $e->getMessage();
            $report["status"] = "FAIL";
        }
        $report["checks"][] = [
            "name" => $name,
            "status" => $status,
            "message" => $message
        ];
    }
}

// Include the audit logic (refactored to focus on data)
require_once __DIR__ . '/../../.agent/skills/system-integrity-guard/scripts/integrity_logic.php';

sendResponse($report);
?>
