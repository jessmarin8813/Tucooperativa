<?php
/**
 * Telegram Notification Helper
 */
function sendTelegramNotification($chat_id, $message) {
    if (!$chat_id) return false;

    $token = getenv('TELEGRAM_TOKEN');
    if (!$token) {
        // Fallback to reading from .env manually if getenv fails in some contexts
        $env = parse_ini_file(__DIR__ . '/../../.env');
        $token = $env['TELEGRAM_TOKEN'] ?? null;
    }

    if (!$token) return false;

    $url = "https://api.telegram.org/bot$token/sendMessage";
    $data = [
        'chat_id' => $chat_id,
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
