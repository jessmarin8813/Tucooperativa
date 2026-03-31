<?php
/**
 * OMNI-GUARD: Mass PHP Tag Sanitizer
 * Removes all closing ?> tags from PHP files in the API directory
 * to prevent accidental whitespace corruption in JSON responses.
 */

$directory = __DIR__ . '/api';
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));
$filesCleaned = 0;

foreach ($iterator as $file) {
    if ($file->isFile() && $file->getExtension() === 'php') {
        $content = file_get_contents($file->getPathname());
        
        // Check for the closing tag
        if (strpos($content, '?>') !== false) {
            // Remove the closing tag and any trailing whitespace/newlines
            $newContent = preg_replace('/\?>\s*$/', '', $content);
            
            if ($newContent !== $content) {
                file_put_contents($file->getPathname(), $newContent);
                $filesCleaned++;
                echo "[CLEANED] " . $file->getPathname() . "\n";
            }
        }
    }
}

echo "\nTotal de archivos saneados: $filesCleaned\n";
