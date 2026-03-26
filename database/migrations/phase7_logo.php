<?php
/**
 * Migration: Phase 7 - VIP Corporate Data (Logo Support)
 * Path: database/migrations/phase7_logo.php
 */
require_once __DIR__ . '/../../api/includes/db.php';

$db = DB::getInstance();

try {
    echo "Starting migration: Phase 7 - Logo Support...\n";

    // 1. Ensure 'logo_path' column exists in 'cooperativas'
    $stmt = $db->query("SHOW COLUMNS FROM cooperativas LIKE 'logo_path'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE cooperativas ADD COLUMN logo_path VARCHAR(500) DEFAULT NULL AFTER lema");
        echo "Column 'logo_path' added to 'cooperativas'.\n";
    } else {
        echo "Column 'logo_path' already exists.\n";
    }

    // 2. Ensure 'lema' column exists (just in case of mismatch)
    $stmt = $db->query("SHOW COLUMNS FROM cooperativas LIKE 'lema'");
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE cooperativas ADD COLUMN lema VARCHAR(255) DEFAULT NULL AFTER rif");
        echo "Column 'lema' added to 'cooperativas'.\n";
    }

    // 3. Ensure 'nombre_cooperativa' exists (renaming 'nombre' if it's the old one, but keeping 'nombre' as alias if needed)
    $stmt = $db->query("SHOW COLUMNS FROM cooperativas LIKE 'nombre_cooperativa'");
    if (!$stmt->fetch()) {
        // If 'nombre' exists but 'nombre_cooperativa' doesn't, we can add it or rename. 
        // Based on get_config.php, it expects nombre_cooperativa.
        $stmt2 = $db->query("SHOW COLUMNS FROM cooperativas LIKE 'nombre'");
        if ($stmt2->fetch()) {
            $db->exec("ALTER TABLE cooperativas CHANGE nombre nombre_cooperativa VARCHAR(255) NOT NULL");
            echo "Column 'nombre' renamed to 'nombre_cooperativa'.\n";
        } else {
            $db->exec("ALTER TABLE cooperativas ADD COLUMN nombre_cooperativa VARCHAR(255) NOT NULL AFTER id");
            echo "Column 'nombre_cooperativa' created.\n";
        }
    }

    echo "Migration completed successfully.\n";
} catch (Exception $e) {
    echo "MIGRATION ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
