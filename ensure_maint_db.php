<?php
require_once 'api/includes/middleware.php';
$db = DB::getInstance();
try {
    $db->query("CREATE TABLE IF NOT EXISTS mantenimiento_catalogo (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cooperativa_id INT NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (cooperativa_id, nombre)
    )");
    
    $items = ['Cambio de Aceite', 'Filtros (Aire/Gasolina)', 'Frenos / Pastillas', 'Rotación de Cauchos', 'Batería / Sistema Eléctrico', 'Kit de Tiempo / Correas'];
    foreach ($items as $item) {
        $stmt = $db->prepare("INSERT IGNORE INTO mantenimiento_catalogo (cooperativa_id, nombre) VALUES (1, ?)");
        $stmt->execute([$item]);
    }
    echo "SUCCESS";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
