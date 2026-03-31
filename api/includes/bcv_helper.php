<?php
/**
 * Utility: Official BCV Exchange Rate Helper (Direct Scraping v6.7)
 * Path: api/includes/bcv_helper.php
 */

function get_bcv_rate() {
    $db = DB::getInstance();
    $now = time();
    $today = date('Y-m-d', $now);
    $hour = (int)date('H', $now);

    // 1. OBTENER LA ÚLTIMA TASA DISPONIBLE EN BD
    $stmt = $db->prepare("SELECT tasa, created_at FROM tasas_cambio WHERE moneda = 'USD' ORDER BY created_at DESC LIMIT 1");
    $stmt->execute();
    $last_entry = $stmt->fetch(PDO::FETCH_ASSOC);
    $last_rate = $last_entry ? floatval($last_entry['tasa']) : 470;
    
    // 2. DETERMINAR SI NECESITAMOS ESCANEAR (REGLA: PASADAS LAS 4 PM Y NO TENEMOS LA TASA DE MAÑANA)
    $needs_sync = false;
    if (!$last_entry) {
        $needs_sync = true;
    } else {
        $last_update_ts = strtotime($last_entry['created_at']);
        $last_update_date = date('Y-m-d', $last_update_ts);
        
        // Ventana crítica: pasadas las 16:00 y tenemos dato de ayer (o antes)
        if ($hour >= 16 && $last_update_date < $today) {
            $needs_sync = true;
        }
        // O si el dato tiene más de 12 horas
        elseif (($now - $last_update_ts) > (12 * 3600)) {
            $needs_sync = true;
        }
    }

    if (!$needs_sync && $last_entry) {
        return floatval($last_entry['tasa']);
    }

    // 3. ESTRATEGIA: SCRAPING DIRECTO DEL BCV (MÁS FIABLE QUE CUALQUIER API)
    $rate = null;
    $url_bcv = "https://www.bcv.org.ve/";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url_bcv);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && !empty($html)) {
        // Regex para extraer el valor del div id="dolar"
        if (preg_match('/id="dolar".*?strong>\s*([\d,.]+)\s*<\/strong>/s', $html, $matches)) {
            $rate = floatval(str_replace(',', '.', trim($matches[1])));
        }
    }

    // 4. FALLBACK: DOLARAPI (ULTIMA OPCIÓN SI EL BCV ESTÁ CAÍDO O BLOQUEA)
    if (!$rate) {
        $url_api = "https://ve.dolarapi.com/v1/dolares/oficial";
        $resp = @file_get_contents($url_api);
        if ($resp) {
            $data = json_decode($resp, true);
            $val = $data['precio'] ?? $data['promedio'] ?? null;
            if ($val) {
                $rate = floatval($val);
                // Corrección de escala si el API viene mal (10x bug)
                if ($last_rate > 300 && $rate < 100) { $rate *= 10; }
            }
        }
    }

    // 5. GUARDAR Y RETORNAR
    if ($rate) {
        try {
            $is_different_rate = (abs($rate - $last_rate) > 0.0001);
            $last_update_date = $last_entry ? date('Y-m-d', strtotime($last_entry['created_at'])) : '';
            
            if (!$last_entry || $last_update_date < $today || $is_different_rate) {
                $stmt = $db->prepare("INSERT INTO tasas_cambio (moneda, tasa, fecha, fuente) VALUES ('USD', ?, ?, 'BCV') ON DUPLICATE KEY UPDATE tasa = ?, created_at = CURRENT_TIMESTAMP");
                $stmt->execute([$rate, $today, $rate]);
            }
        } catch (Exception $e) { /* DB error */ }
        return $rate;
    }

    return $last_entry ? floatval($last_entry['tasa']) : 36.50;
}
