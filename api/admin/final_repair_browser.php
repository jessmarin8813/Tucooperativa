<?php
require_once __DIR__ . '/../includes/db.php';
$db = DB::getInstance();

try {
    echo "REPARANDO COOPERATIVAS (cuota/moneda/chat_id)...\n";
    $stmt = $db->query("DESCRIBE cooperativas");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('cuota_diaria', $cols)) {
        echo "Añadiendo cuota_diaria...\n";
        $db->exec("ALTER TABLE cooperativas ADD COLUMN cuota_diaria FLOAT DEFAULT 10 AFTER telegram_bot_name");
    }
    if (!in_array('moneda', $cols)) {
        echo "Añadiendo moneda...\n";
        $db->exec("ALTER TABLE cooperativas ADD COLUMN moneda VARCHAR(10) DEFAULT 'USD' AFTER cuota_diaria");
    }
    if (!in_array('telegram_chat_id', $cols)) {
        echo "Añadiendo telegram_chat_id...\n";
        $db->exec("ALTER TABLE cooperativas ADD COLUMN telegram_chat_id BIGINT AFTER telegram_bot_token");
    }

    echo "SUCCESS\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
