<?php
/**
 * Utility: BCV Exchange Rate Helper
 * Path: api/includes/bcv_helper.php
 */

function get_bcv_rate() {
    $db = DB::getInstance();
    $today = date('Y-m-d');
    
    // 1. Try to get today's rate from DB
    $stmt = $db->prepare("SELECT tasa FROM tasas_cambio WHERE fecha = ? AND moneda = 'USD' LIMIT 1");
    $stmt->execute([$today]);
    $db_rate = $stmt->fetchColumn();
    
    if ($db_rate) {
        return floatval($db_rate);
    }
    
    // 2. If not in DB, try DolarAPI
    $url = "https://ve.dolarapi.com/v1/dolares/oficial";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if (isset($data['promedio'])) {
            $rate = floatval($data['promedio']);
            
            // Save to DB for today
            try {
                $stmt = $db->prepare("INSERT INTO tasas_cambio (moneda, tasa, fecha, fuente) VALUES ('USD', ?, ?, 'BCV') ON DUPLICATE KEY UPDATE tasa = ?");
                $stmt->execute([$rate, $today, $rate]);
            } catch (Exception $e) {
                error_log("Failed to save rate to DB: " . $e->getMessage());
            }
            
            return $rate;
        }
    }
    
    // 3. Fallback to last known rate in DB
    $last_rate = $db->query("SELECT tasa FROM tasas_cambio WHERE moneda = 'USD' ORDER BY fecha DESC LIMIT 1")->fetchColumn();
    if ($last_rate) return floatval($last_rate);
    
    // 4. Ultimate fallback (Static)
    return 36.50; 
}
?>
