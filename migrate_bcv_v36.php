<?php
/**
 * Migration: BCV Rate Integration & Multi-Currency Support
 * Version: v36.2.3
 */
require_once __DIR__ . '/api/includes/db.php';

try {
    $db = DB::getInstance();
    
    echo "[MIGRATION] Creating 'tasas_cambio' table...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS tasas_cambio (
        id INT AUTO_INCREMENT PRIMARY KEY,
        moneda VARCHAR(10) DEFAULT 'USD',
        tasa DECIMAL(10,4) NOT NULL,
        fecha DATE NOT NULL,
        fuente VARCHAR(50) DEFAULT 'BCV',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (fecha, moneda)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    
    echo "[MIGRATION] Updating 'gastos' table for multi-currency...\n";
    
    // Add moneda column if not exists
    $stmt = $db->query("SHOW COLUMNS FROM gastos LIKE 'moneda'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE gastos ADD COLUMN moneda ENUM('USD', 'Bs') DEFAULT 'USD' AFTER monto");
    }
    
    // Add tasa_cambio column if not exists
    $stmt = $db->query("SHOW COLUMNS FROM gastos LIKE 'tasa_cambio'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE gastos ADD COLUMN tasa_cambio DECIMAL(10,4) DEFAULT 1.0000 AFTER moneda");
    }

    echo "[MIGRATION] Updating 'pagos_reportados' table for rate tracking...\n";
    $stmt = $db->query("SHOW COLUMNS FROM pagos_reportados LIKE 'tasa_cambio'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE pagos_reportados ADD COLUMN tasa_cambio DECIMAL(10,4) DEFAULT 1.0000 AFTER moneda");
    }

    echo "[SUCCESS] Migration completed successfully.\n";
    
} catch (Exception $e) {
    echo "[ERROR] Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
