<?php
require_once __DIR__ . '/api/includes/db.php';
$db = DB::getInstance();
try {
    $sql = "CREATE TABLE IF NOT EXISTS `incidencias` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `cooperativa_id` int(11) NOT NULL,
      `vehiculo_id` int(11) NOT NULL,
      `chofer_id` int(11) NOT NULL,
      `tipo` varchar(50) NOT NULL,
      `descripcion` text DEFAULT NULL,
      `foto_path` varchar(255) DEFAULT NULL,
      `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    
    $db->exec($sql);
    echo "✅ Tabla 'incidencias' creada exitosamente.\n";
} catch (Exception $e) {
    echo "❌ Error al crear tabla: " . $e->getMessage() . "\n";
}
?>
