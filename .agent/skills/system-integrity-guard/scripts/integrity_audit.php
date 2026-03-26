<?php
/**
 * OMNI-GUARD v5.0 - Integrity Audit Tool (CLI)
 * Path: .agent/skills/system-integrity-guard/scripts/integrity_audit.php
 */
echo "Ejecutando Guardia de Integridad (CLI)...\n";

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

require_once __DIR__ . '/integrity_logic.php';

echo json_encode($report, JSON_PRETTY_PRINT);
if ($report['status'] === 'FAIL') exit(1);
?>
