<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=tu_cooperativa', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("SHOW COLUMNS FROM usuarios");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (!in_array('telegram_chat_id', $columns)) {
        echo "Adding telegram_chat_id..." . PHP_EOL;
        $pdo->exec("ALTER TABLE usuarios ADD COLUMN telegram_chat_id VARCHAR(50) DEFAULT NULL AFTER rol");
    }

    if (!in_array('telegram_link_token', $columns)) {
        echo "Adding telegram_link_token..." . PHP_EOL;
        $pdo->exec("ALTER TABLE usuarios ADD COLUMN telegram_link_token VARCHAR(100) DEFAULT NULL AFTER telegram_chat_id");
    }

    echo "SUCCESS: Migration completed." . PHP_EOL;
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . PHP_EOL;
}
