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
    
    // 2. DETERMINAR SI NECESITAMOS ESCANEAR (SOLO EN VENTANA 4:00 PM - 5:30 PM MON-FRI)
    $needs_scan = false;
    
    // Si es fin de semana (Sábado o Domingo), NO ESCANEAMOS. Usamos lo que hay.
    if ($dayOfWeek == 0 || $dayOfWeek == 6) {
        $needs_scan = false;
    } else {
        // Es día de semana. ¿Estamos en la ventana de publicación del BCV?
        $is_update_window = ($hour == 16 || ($hour == 17 && $minute <= 30));
        
        if ($is_update_window) {
            // Verificar si ya actualizamos en esta ventana hoy
            if ($last_entry) {
                $last_update_date = date('Y-m-d', strtotime($last_entry['created_at']));
                $last_update_hour = (int)date('H', strtotime($last_entry['created_at']));
                
                // Si la última actualización NO fue hoy en la ventana de la tarde, necesitamos escanear
                if ($last_update_date != $today || $last_update_hour < 16) {
                    $needs_scan = true;
                }
            } else {
                $needs_scan = true; // No hay nada en BD, escanear
            }
        }
    }

    // 3. SI NO SE NECESITA ESCANEO, RETORNAR LO QUE TENEMOS
    if (!$needs_scan && $last_entry) {
        return floatval($last_entry['tasa']);
    }

    // 4. SOLO SI LLEGAMOS AQUÍ, HACEMOS LA PETICIÓN EXTERNA (VENTANA QUIRÚRGICA)
    if ($needs_scan) {
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
                
                // Guardar solo si es diferente a la última o si es un nuevo día
                try {
                    if (!$last_entry || $rate != floatval($last_entry['tasa'])) {
                        // Usar ON DUPLICATE por seguridad, aunque la lógica ya filtra
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
