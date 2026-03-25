<?php
/**
 * Telegram Notification Bridge - Secure Edition (Anti-Flood)
 * Path: api/notificaciones.php
 */

function sendTelegramNotification($chat_id, $message, $coop_id = null) {
    if (!$chat_id) return false;

    // --- ESCUDO ANTI-FLOOD (RATE LIMITING) ---
    $limit_seconds = 60; // Ventana de tiempo
    $max_messages = 5;   // Mensajes permitidos en esa ventana
    
    $cache_dir = __DIR__ . '/tmp/ratelimit';
    if (!is_dir($cache_dir)) @mkdir($cache_dir, 0777, true);
    
    $cache_file = $cache_dir . '/tg_' . $chat_id . '.json';
    $now = time();
    $data = ['count' => 0, 'first_msg_time' => $now];

    if (file_exists($cache_file)) {
        $data = json_decode(file_get_contents($cache_file), true);
        
        // Si la ventana ya pasó, reseteamos el contador
        if ($now - $data['first_msg_time'] > $limit_seconds) {
            $data = ['count' => 1, 'first_msg_time' => $now];
        } else {
            // Si estamos en la ventana, revisamos el límite
            if ($data['count'] >= $max_messages) {
                error_log("Rate Limit Hit: Spam detectado para chat_id $chat_id. Mensaje bloqueado.");
                return false; 
            }
            $data['count']++;
        }
    } else {
        $data['count'] = 1;
    }
    
    // Guardar estado del rate limit
    file_put_contents($cache_file, json_encode($data));
    // ------------------------------------------

    // Lógica Unificada: Bot Maestro
    $token = "TU_MASTER_TOKEN_AQUI"; 
    $env_file = __DIR__ . '/../.env';
    if (file_exists($env_file)) {
        $env = parse_ini_file($env_file);
        if (isset($env['TELEGRAM_TOKEN'])) $token = $env['TELEGRAM_TOKEN'];
    }

    if (!$token || $token === "TU_MASTER_TOKEN_AQUI") {
        return false;
    }

    $url = "https://api.telegram.org/bot$token/sendMessage";
    $payload = [
        'chat_id' => $chat_id,
        'text' => $message,
        'parse_mode' => 'Markdown'
    ];

    $options = [
        'http' => [
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($payload),
            'timeout' => 5 // Asegurar que no tranque el servidor
        ],
    ];

    $context  = stream_context_create($options);
    $result = @file_get_contents($url, false, $context);
    
    return $result !== false;
}
