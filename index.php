<?php
/**
 * Main Entry Point (TuCooperativa)
 * Redirects to the production build of the React Frontend
 */
$target = '/TuCooperativa/client/dist/';

if (file_exists('client/dist/index.html')) {
    header('Location: ' . $target);
} else {
    echo '<h1>Error: Build No Encontrado</h1>';
    echo '<p>Por favor, ejecuta <strong>build.bat</strong> antes de acceder via Apache.</p>';
}
?>
