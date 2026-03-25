<?php
require_once 'api/includes/db.php';
$db = DB::getInstance();

$pass = password_hash('admin123', PASSWORD_BCRYPT);

try {
    // 1. Limpieza total de cuentas previas para evitar conflictos de hashes
    $db->exec("DELETE FROM usuarios WHERE username IN ('admin', 'superadmin') OR rol IN ('admin', 'superadmin', 'dueno')");
    echo "LIMPIEZA COMPLETADA.\n";

    // 2. Crear SuperAdmin (MODO DIOS)
    $db->prepare("INSERT INTO usuarios (username, password_hash, rol, nombre, cooperativa_id) 
                  VALUES ('superadmin', ?, 'superadmin', 'Administrador Global', 1)")->execute([$pass]);
    
    // 3. Crear Admin (DUEÑO/OWNER)
    $db->prepare("INSERT INTO usuarios (username, password_hash, rol, nombre, cooperativa_id) 
                  VALUES ('admin', ?, 'admin', 'Dueño Cooperativa', 1)")->execute([$pass]);

    echo "CUENTAS CREADAS CON ÉXITO:\n";
    echo "- superadmin / admin123\n";
    echo "- admin / admin123\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
