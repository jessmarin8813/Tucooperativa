<?php
/**
 * API: Upload Cooperative Logo
 * Path: api/admin/upload_logo.php
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
if (!in_array($user['rol'], ['superadmin', 'owner', 'admin', 'dueno'])) {
    sendResponse(['error' => 'Forbidden'], 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

if (!isset($_FILES['logo'])) {
    sendResponse(['error' => 'No se recibió ninguna imagen'], 400);
}

$file = $_FILES['logo'];
$coop_id = $user['cooperativa_id'];

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!in_array($file['type'], $allowedTypes)) {
    sendResponse(['error' => 'Formato no permitido. Use JPG, PNG o WEBP'], 400);
}

// Ensure directory exists
$uploadDir = __DIR__ . '/../../uploads/logos/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = "logo_coop_" . $coop_id . "_" . time() . "." . $extension;
$targetPath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    $db = DB::getInstance();
    $logoUrl = "uploads/logos/" . $filename;
    
    try {
        $stmt = $db->prepare("UPDATE cooperativas SET logo_path = :logo WHERE id = :id");
        $stmt->execute(['logo' => $logoUrl, 'id' => $coop_id]);
        
        sendResponse([
            'success' => true, 
            'message' => 'Logo actualizado correctamente',
            'logo_path' => $logoUrl
        ]);
    } catch (Exception $e) {
        sendResponse(['error' => 'Error al guardar en base de datos'], 500);
    }
} else {
    sendResponse(['error' => 'Error al mover el archivo subido'], 500);
}
