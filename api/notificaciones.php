<?php
/**
 * Telegram Notification Bridge
 */
function sendTelegramNotification($telegram_id, $message) {
    // En un entorno real, esto vendría de un .env o config
    $token = "TU_TOKEN_AQUI"; 
    $url = "https://api.telegram.org/bot$token/sendMessage";

    $data = [
        'chat_id' => $telegram_id,
        'text' => $message,
        'parse_mode' => 'Markdown'
    ];

    $options = [
        'http' => [
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data),
        ],
    ];

    $context  = stream_context_create($options);
    $result = @file_get_contents($url, false, $context);
    
    return $result !== false;
}
