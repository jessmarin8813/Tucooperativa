<?php
/**
 * Utility: BCV Exchange Rate Helper
 * Path: api/includes/bcv_helper.php
 */

function get_bcv_rate() {
    $db = DB::getInstance();
    $today = date('Y-m-d');
    $now = time();
    $hour = (int)date('H', $now);
    $dayOfWeek = (int)date('w', $now); // 0=Sun, 1=Mon, ..., 6=Sat

    // 1. Determine cache time based on BCV typical publication (4 PM - 6 PM)
    $is_critical_window = ($dayOfWeek >= 1 && $dayOfWeek <= 5 && $hour >= 16 && $hour <= 18);
    $cache_seconds = $is_critical_window ? (15 * 60) : (4 * 3600);
    
    // Weekend/Monday specific: Friday rate is valid until Monday 4:00 PM
    if ($dayOfWeek == 0 || $dayOfWeek == 6 || ($dayOfWeek == 1 && $hour < 16)) {
        $cache_seconds = 12 * 3600; // Prolong for weekends
    }

    // 2. Try to get the latest rate from DB
    $stmt = $db->prepare("SELECT tasa, created_at FROM tasas_cambio WHERE moneda = 'USD' ORDER BY created_at DESC LIMIT 1");
    $stmt->execute();
    $last_entry = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($last_entry) {
        $last_update_time = strtotime($last_entry['created_at']);
        if (($now - $last_update_time) < $cache_seconds) {
            return floatval($last_entry['tasa']);
        }
    }
    
    // 3. Fallback or Refresh: try DolarAPI
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
            
            // Save to DB (Only if rate changed or if it's a new day's record)
            try {
                if (!$last_entry || $rate != floatval($last_entry['tasa']) || date('Y-m-d', strtotime($last_entry['created_at'])) != $today) {
                    $stmt = $db->prepare("INSERT INTO tasas_cambio (moneda, tasa, fecha, fuente) VALUES ('USD', ?, ?, 'BCV') ON DUPLICATE KEY UPDATE tasa = ?, created_at = CURRENT_TIMESTAMP");
                    $stmt->execute([$rate, $today, $rate]);
                } else {
                    // Just update timestamp to reset cache timer if rate is the same
                    $db->prepare("UPDATE tasas_cambio SET created_at = CURRENT_TIMESTAMP WHERE moneda = 'USD' AND fecha = ?")->execute([$today]);
                }
            } catch (Exception $e) {
                error_log("Failed to save rate to DB: " . $e->getMessage());
            }
            
            return $rate;
        }
    }
    
    // Ultimate fallback to last known rate
    return $last_entry ? floatval($last_entry['tasa']) : 36.50; 
}
?>
