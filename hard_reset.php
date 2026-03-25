<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();

$pass = password_hash('admin123', PASSWORD_BCRYPT);

try {
    // 1. Eliminar anteriores
    $db->exec("DELETE FROM usuarios WHERE username IN ('admin', 'superadmin')");
    
    // 2. Insertar SuperAdmin
    $db->prepare("INSERT INTO usuarios (username, email, password_hash, rol, nombre, cooperativa_id) 
                  VALUES ('superadmin', 'superadmin@system.com', ?, 'superadmin', 'Administrador Global', 1)")->execute([$pass]);
    
    // 3. Insertar Admin
    $db->prepare("INSERT INTO usuarios (username, email, password_hash, rol, nombre, cooperativa_id) 
                  VALUES ('admin', 'admin@linea.com', ?, 'admin', 'Dueño Cooperativa', 1)")->execute([$pass]);

    echo "RESET COMPLETADO CON ÉXITO.\n";
    
    $stmt = $db->query("SELECT id, username, email, rol, password_hash FROM usuarios WHERE username IN ('admin', 'superadmin')");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $row) {
        $valid = password_verify('admin123', $row['password_hash']) ? 'VALIDO' : 'INVALIDO';
        echo "USER: {$row['username']} | ROL: {$row['rol']} | PASS: $valid\n";
    }

} catch (Exception $e) {
    echo "ERROR FATAL: " . $e->getMessage();
}
