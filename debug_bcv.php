<?php
require_once __DIR__ . '/api/includes/db.php';

function test_bcv_api() {
    $url = "https://ve.dolarapi.com/v1/dolares/oficial";
    echo "Probando URL: $url\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    if ($error) echo "CURL Error: $error\n";
    
    echo "Response:\n$response\n";
    
    $data = json_decode($response, true);
    if (isset($data['promedio'])) {
        echo "TASA DETECTADA: " . $data['promedio'] . "\n";
    } else {
        echo "No se encontró el campo 'promedio' en la respuesta.\n";
    }
}

test_bcv_api();
?>
