<?php
/**
 * API (Internal): Update System Configuration
 * Path: api/system/update_config.php
 * Allows the Autonomous Bot to push critical updates (BCV Rate).
 */
require_once __DIR__ . '/../includes/db.php';

// Accept JSON payload
$raw = file_get_contents("php://input");
$data = json_decode($raw);

if (empty($data)) {
    error_log("[CONFIG ERROR] RAW INPUT: " . $raw);
}

if (!empty($data->clave) && isset($data->valor)) {
    try {
        $db = DB::getInstance();
        
        if ($data->clave === 'bcv_rate') {
            // Update the core tasas_cambio table used by the whole fleet
            $today = date('Y-m-d');
            $rate = floatval($data->valor);
            
            $stmt = $db->prepare("INSERT INTO tasas_cambio (moneda, tasa, fecha, fuente) 
                                 VALUES ('USD', :tasa, :fecha, 'AUTO_BOT') 
                                 ON DUPLICATE KEY UPDATE tasa = :tasa2, created_at = CURRENT_TIMESTAMP");
            $stmt->execute([
                ':tasa' => $rate,
                ':fecha' => $today,
                ':tasa2' => $rate
            ]);
            
            echo json_encode(["status" => "success", "message" => "Tasa BCV sincronizada proactivamente."]);
        } else {
            // General purpose config (Reserved for future)
            echo json_encode(["status" => "error", "message" => "Clave no soportada actualmente."]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
}
?>
