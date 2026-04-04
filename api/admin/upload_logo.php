<?php
/**
 * API: Upload Cooperative Logo
 * Path: api/admin/upload_logo.php
 */
require_once __DIR__ . '/../includes/middleware.php';

$user = checkAuth();
if (!in_array($user['rol'], ['superadmin', 'dueno'])) {
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

// HARDENING: Do not trust $_FILES['logo']['type'] (spoofable)
$imageInfo = @getimagesize($file['tmp_name']);
if (!$imageInfo) {
    sendResponse(['error' => 'El archivo no es una imagen válida o está corrupto'], 400);
}

// Map allowed MIME types to safe extensions
$mimeMap = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp'
];

$detectedMime = $imageInfo['mime'];
if (!isset($mimeMap[$detectedMime])) {
    sendResponse(['error' => 'Formato de imagen no soportado (Use JPG, PNG o WEBP)'], 400);
}

// Ensure the original extension is also in a whitelist to prevent double-extension attacks
$allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
$origExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($origExt, $allowedExts)) {
    sendResponse(['error' => 'La extensión del archivo es inválida'], 400);
}

// Use the detected extension for safety
$extension = $mimeMap[$detectedMime];
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
