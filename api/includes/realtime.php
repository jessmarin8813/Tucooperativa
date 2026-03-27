<?php
/**
 * Realtime Broadcast Helper (PHP -> Realtime Hub)
 */
function broadcastRealtime($type, $data = []) {
    $url = 'http://localhost:8000/broadcast';
    $payload = array_merge(['type' => $type], $data);
    
    $options = [
        'http' => [
            'header'  => "Content-type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($payload),
            'timeout' => 1 // Non-blocking-ish
        ]
    ];
    
    $context  = stream_context_create($options);
    @file_get_contents($url, false, $context);
}
?>
