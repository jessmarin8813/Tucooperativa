<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();
$stmt = $db->query("SELECT id, username, rol, password_hash FROM usuarios");
echo "AUDITORIA DE CREDENCIALES:\n";
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$row['id']} | User: {$row['username']} | Rol: {$row['rol']}\n";
    // Test admin123 against the hash
    if (password_verify('admin123', $row['password_hash'])) {
        echo "   -> Clave 'admin123' VALIDADA ✅\n";
    } else {
        echo "   -> Clave 'admin123' FALLIDA ❌ (Hash: {$row['password_hash']})\n";
    }
}
