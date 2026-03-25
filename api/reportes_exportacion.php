<?php
/**
 * Export & Backup API
 */
require_once 'includes/middleware.php';

$user = checkAuth();
$db = DB::getInstance();
$coop_id = $user['cooperativa_id'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Generate CSV for Payments
    $stmt = $db->prepare("SELECT p.*, v.placa, u.nombre as chofer_nombre 
                         FROM pagos_diarios p
                         JOIN vehiculos v ON p.vehiculo_id = v.id
                         JOIN usuarios u ON p.chofer_id = u.id
                         WHERE p.cooperativa_id = :coop_id 
                         ORDER BY p.fecha DESC");
    $stmt->execute(['coop_id' => $coop_id]);
    $data = $stmt->fetchAll();

    if (empty($data)) {
        sendResponse(['error' => 'No hay datos para exportar'], 404);
    }

    $filename = "reporte_recaudacion_" . date('Y-m-d') . ".csv";
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $filename . '"');

    $output = fopen('php://output', 'w');
    // Header
    fputcsv($output, ['ID', 'Placa', 'Chofer', 'Fecha', 'Cuota', 'Efectivo', 'PagoMovil', 'Estado']);
    
    foreach ($data as $row) {
        fputcsv($output, [
            $row['id'],
            $row['placa'],
            $row['chofer_nombre'],
            $row['fecha'],
            $row['monto'],
            $row['monto_efectivo'],
            $row['monto_pagomovil'],
            $row['estado']
        ]);
    }
    fclose($output);
    exit;

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';

    if ($action === 'db_backup') {
        if ($user['rol'] !== 'superadmin' && $user['rol'] !== 'dueno') {
            sendResponse(['error' => 'Unauthorized'], 403);
        }

        // Generate SQL Backup (Basic PHP logic to avoid mysqldump dependency issues in XAMPP)
        $tables = ['cooperativas', 'usuarios', 'vehiculos', 'rutas', 'odometros', 'pagos_diarios', 'invitaciones'];
        $sql = "-- TuCooperativa DB Backup\n-- Generated: " . date('Y-m-d H:i:s') . "\n\n";

        foreach ($tables as $table) {
            $sql .= "DROP TABLE IF EXISTS `$table`;\n";
            $res = $db->query("SHOW CREATE TABLE `$table`")->fetch();
            $sql .= $res['Create Table'] . ";\n\n";

            $rows = $db->query("SELECT * FROM `$table`")->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as $row) {
                $keys = array_keys($row);
                $values = array_values($row);
                $sql .= "INSERT INTO `$table` (`" . implode("`, `", $keys) . "`) VALUES (" . 
                        implode(", ", array_map(function($v) use ($db) { return $db->quote($v); }, $values)) . ");\n";
            }
            $sql .= "\n";
        }

        // Send via Telegram if superadmin
        if ($user['telegram_id']) {
            require_once 'notificaciones.php';
            // Since we can't easily send files via the simple bridge, we send a notification 
            // and maybe in a real scenario we'd upload to a path or use a proper TG bot upload.
            // For now, we'll mark this as "Ready to download" and return the SQL as local file or text.
            
            $backup_file = "../backups/backup_" . date('Ymd_His') . ".sql";
            if (!is_dir('../backups')) mkdir('../backups');
            file_put_contents($backup_file, $sql);

            $msg = "💾 *BACKUP COMPLETADO - TuCooperativa*\n\n";
            $msg .= "Fecha: " . date('Y-m-d H:i:s') . "\n";
            $msg .= "Archivo: `" . basename($backup_file) . "`\n";
            $msg .= "Status: Disponible en el servidor.";
            sendTelegramNotification($user['telegram_id'], $msg, $coop_id);
            
            sendResponse(['message' => 'Backup generado y notificado', 'file' => basename($backup_file)]);
        } else {
            sendResponse(['error' => 'No tienes Telegram vinculado para recibir el backup'], 400);
        }
    }
}
