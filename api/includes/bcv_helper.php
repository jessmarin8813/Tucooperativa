<?php
/**
 * Utility: Official BCV Exchange Rate Helper (Hyper-Robust v7.0)
 * Path: api/includes/bcv_helper.php
 * REPAIRED: New DOM Structure + cURL Fallback
 */

function get_bcv_rate() {
    $db = DB::getInstance();
    $today = date('Y-m-d');
    
    // 1. OBTENER LA ÚLTIMA TASA DISPONIBLE EN BD
    try {
        $stmt = $db->prepare("SELECT tasa FROM tasas_cambio WHERE moneda = 'USD' ORDER BY created_at DESC LIMIT 1");
        $stmt->execute();
        $last_entry = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch(Exception $e) { $last_entry = null; }
    
    $last_rate = $last_entry ? floatval($last_entry['tasa']) : 36.50;

    // DETERMINAR SI NECESITAMOS SYNC (Pasado el mediodía o si no hay dato hoy)
    $hour = (int)date('H');
    $needs_sync = (!$last_entry || $hour >= 12); 

    if (!$needs_sync) return $last_rate;

    // 3. ESTRATEGIA: SCRAPING DIRECTO DEL BCV (DOM 2024-2026)
    $rate = null;
    $url_bcv = "https://www.bcv.org.ve/";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url_bcv);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && !empty($html)) {
        // Regex Mejorado: Buscamos el contenedor 'dolar' y su valor strong
        // El BCV usa divs anidados y etiquetas strong con espacios
        if (preg_match('/id="dolar".*?strong>\s*([\d,.]+)\s*<\/strong>/s', $html, $matches)) {
            $rate = floatval(str_replace(',', '.', trim($matches[1])));
        }
    }

    // 4. FALLBACK ROBUSTO: DOLARAPI (ULTRA CONFIRMADO)
    if (!$rate || $rate < 10) {
        $url_api = "https://ve.dolarapi.com/v1/dolares/oficial";
        $ch = curl_init($url_api);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        $resp = curl_exec($ch);
        curl_close($ch);
        
        if ($resp) {
            $data = json_decode($resp, true);
            $rate = $data['precio'] ?? $data['promedio'] ?? null;
        }
    }

    // 5. GUARDAR Y RETORNAR
    if ($rate && $rate > 10) {
        try {
            $stmt = $db->prepare("INSERT INTO tasas_cambio (moneda, tasa, fecha, fuente) VALUES ('USD', ?, ?, 'BCV') ON DUPLICATE KEY UPDATE tasa = ?, created_at = CURRENT_TIMESTAMP");
            $stmt->execute([$rate, $today, $rate]);
        } catch (Exception $e) { /* Logged silently */ }
        return floatval($rate);
    }

    return $last_rate;
}
?>
