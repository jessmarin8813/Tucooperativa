<?php
/**
 * Utility: BCV Exchange Rate Helper
 * Path: api/includes/bcv_helper.php
 */

function get_bcv_rate() {
    $db = DB::getInstance();
    $now = time();
    $today = date('Y-m-d', $now);
    $hour = (int)date('H', $now);
    $minute = (int)date('i', $now);
    $dayOfWeek = (int)date('w', $now); // 0=Sun, 1=Mon, ..., 6=Sat

    // 1. OBTENER LA ÚLTIMA TASA DISPONIBLE EN BD
    $stmt = $db->prepare("SELECT tasa, created_at FROM tasas_cambio WHERE moneda = 'USD' ORDER BY created_at DESC LIMIT 1");
    $stmt->execute();
    $last_entry = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // 2. DETERMINAR SI NECESITAMOS ESCANEAR
    $needs_sync = false;
    
    if (!$last_entry) {
        $needs_sync = true;
    } else {
        $last_update_ts = strtotime($last_entry['created_at']);
        $last_update_date = date('Y-m-d', $last_update_ts);
        
        // Window Logic:
        // A. If the data is simply too old (> 8h)
        if (($now - $last_update_ts) > (8 * 3600)) {
            $needs_sync = true;
        }
        // B. If today's rate is supposed to be out (after 16:00) but we still have yesterday's (or older)
        elseif ($hour >= 16 && $last_update_date < $today) {
            $needs_sync = true;
        }
    }

    // 3. SI NO SE NECESITA ESCANEO, RETORNAR LO QUE TENEMOS
    if (!$needs_sync && $last_entry) {
        return floatval($last_entry['tasa']);
    }

    // 4. SOLO SI LLEGAMOS AQUÍ, HACEMOS LA PETICIÓN EXTERNA
    if ($needs_sync) {
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
            $rateValue = $data['precio'] ?? $data['promedio'] ?? null;
            
            if ($rateValue) {
                $rate = floatval($rateValue);
                
                // Guardar solo si es diferente a la última o si es un nuevo día
                try {
                    if (!$last_entry || $rate != floatval($last_entry['tasa'])) {
                        $stmt = $db->prepare("INSERT INTO tasas_cambio (moneda, tasa, fecha, fuente) VALUES ('USD', ?, ?, 'BCV') ON DUPLICATE KEY UPDATE tasa = ?, created_at = CURRENT_TIMESTAMP");
                        $stmt->execute([$rate, $today, $rate]);
                    }
                } catch (Exception $e) {
                    error_log("BCV Save Error: " . $e->getMessage());
                }
                return $rate;
            }
        }
    }
    
    // Fallback final
    return $last_entry ? floatval($last_entry['tasa']) : 36.50; 
}
?>
