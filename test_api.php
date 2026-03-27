<?php
require 'api/includes/db.php';
$_SESSION['user_id'] = 1; // Simulation
$_SESSION['cooperativa_id'] = 1;
$_SESSION['rol'] = 'admin';
require 'api/fleet/vehiculos.php';
?>
