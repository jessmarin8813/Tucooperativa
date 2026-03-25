<?php
/**
 * GLOBAL COLUMN FIXER (fecha_inicio -> started_at)
 */
echo "--- INICIANDO GLOBAL FIXER ---\n";

function fix_dir($dir) {
    $it = new RecursiveDirectoryIterator($dir);
    foreach (new RecursiveIteratorIterator($it) as $file) {
        if ($file->getExtension() == 'php') {
            $p = $file->getPathname();
            $content = file_get_contents($p);
            if (strpos($content, 'fecha_inicio') !== false) {
                $content = str_replace('fecha_inicio', 'started_at', $content);
                file_put_contents($p, $content);
                echo "[FIXED] $p\n";
            }
        }
    }
}

fix_dir('api');
echo "--- GLOBAL FIXER FINALIZADO ---\n";
