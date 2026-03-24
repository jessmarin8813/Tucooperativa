-- Schema for TuCooperativa SaaS
-- A transport management system with multi-tenant isolation.

CREATE DATABASE IF NOT EXISTS tu_cooperativa;
USE tu_cooperativa;

-- 1. Tenants (Cooperativas)
CREATE TABLE IF NOT EXISTS cooperativas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    rif VARCHAR(50) UNIQUE NOT NULL,
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users (RBAC: Admin, Owner, Driver)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'dueno', 'chofer') NOT NULL,
    telegram_id BIGINT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    INDEX (cooperativa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Vehicles
CREATE TABLE IF NOT EXISTS vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    dueno_id INT NOT NULL,
    placa VARCHAR(20) UNIQUE NOT NULL,
    modelo VARCHAR(100),
    anio YEAR,
    cuota_diaria DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    FOREIGN KEY (dueno_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX (cooperativa_id),
    INDEX (dueno_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Routes (Start/End of Route)
CREATE TABLE IF NOT EXISTS rutas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    vehiculo_id INT NOT NULL,
    chofer_id INT NOT NULL,
    estado ENUM('activa', 'finalizada') DEFAULT 'activa',
    monto_efectivo DECIMAL(10, 2) DEFAULT 0.00,
    monto_pagomovil DECIMAL(10, 2) DEFAULT 0.00,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE RESTRICT,
    FOREIGN KEY (chofer_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX (cooperativa_id),
    INDEX (vehiculo_id),
    INDEX (chofer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Odometer Logs (Fuel Fraud Detection)
CREATE TABLE IF NOT EXISTS odometros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    ruta_id INT NOT NULL,
    tipo ENUM('inicio', 'fin') NOT NULL,
    valor DECIMAL(12, 2) NOT NULL,
    foto_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE CASCADE,
    INDEX (cooperativa_id),
    INDEX (ruta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Daily Payments (Flat Fees)
CREATE TABLE IF NOT EXISTS pagos_diarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    vehiculo_id INT NOT NULL,
    chofer_id INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    monto_efectivo DECIMAL(10, 2) DEFAULT 0.00,
    monto_pagomovil DECIMAL(10, 2) DEFAULT 0.00,
    fecha DATE NOT NULL,
    estado ENUM('pendiente', 'pagado') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE RESTRICT,
    FOREIGN KEY (chofer_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX (cooperativa_id),
    INDEX (vehiculo_id),
    INDEX (chofer_id),
    UNIQUE INDEX unique_payment (vehiculo_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Driver Invitations (Deep Linking)
CREATE TABLE IF NOT EXISTS invitaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    usada TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    INDEX (cooperativa_id),
    INDEX (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
