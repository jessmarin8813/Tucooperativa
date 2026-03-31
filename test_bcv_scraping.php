<?php
$url = "https://www.bcv.org.ve/";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
$html = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    // Regex for: <div id="dolar"><strong> 473,87020000 </strong></div>
    if (preg_match('/id="dolar".*?strong>\s*([\d,.]+)\s*<\/strong>/s', $html, $matches)) {
        $rate = str_replace(',', '.', $matches[1]);
        echo "FOUND BCV RATE: " . $rate . "\n";
    } else {
        echo "Regex failed. HTML length: " . strlen($html) . "\n";
        // Show a snippet of the area
        if (strpos($html, 'id="dolar"') !== false) {
            echo "Snippet: " . substr($html, strpos($html, 'id="dolar"'), 200) . "\n";
        }
    }
} else {
    echo "HTTP Error: $httpCode\n";
}
?>
