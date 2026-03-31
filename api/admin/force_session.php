<?php
session_start();
$_SESSION['user_id'] = 1;
$_SESSION['rol'] = 'admin';
$_SESSION['cooperativa_id'] = 1;
$_SESSION['nombre'] = 'Admin Debug';
echo session_id();
