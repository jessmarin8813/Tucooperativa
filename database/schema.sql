-- Schema for TuCooperativa SaaS (v17.6-STABLE)
-- A transport management system with multi-tenant isolation.

CREATE DATABASE IF NOT EXISTS tu_cooperativa;
USE tu_cooperativa;

-- 1. Tenants (Cooperativas)
CREATE TABLE IF NOT EXISTS cooperativas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    rif VARCHAR(50) UNIQUE NOT NULL,
    telegram_bot_token VARCHAR(255),
    telegram_chat_id BIGINT,
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    telegram_bot_name VARCHAR(255),
    cuota_diaria FLOAT DEFAULT 0,
    moneda VARCHAR(10) DEFAULT 'USD',
    banco_nombre VARCHAR(100),
    banco_tipo VARCHAR(50),
    banco_identidad VARCHAR(50),
    banco_telefono VARCHAR(50),
    nombre_cooperativa VARCHAR(255),
    lema VARCHAR(255),
    logo_path VARCHAR(500)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users (RBAC)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(20),
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'dueno', 'chofer', 'superadmin') NOT NULL,
    telegram_chat_id VARCHAR(50),
    telegram_link_token VARCHAR(100),
    telegram_id BIGINT UNIQUE,
    pago_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    INDEX (cooperativa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Drivers (Extracted from users or dedicated for Telegram)
CREATE TABLE IF NOT EXISTS choferes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) UNIQUE,
    telegram_id BIGINT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    INDEX (cooperativa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Vehicles
CREATE TABLE IF NOT EXISTS vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    dueno_id INT NOT NULL,
    chofer_id INT,
    placa VARCHAR(20) UNIQUE NOT NULL,
    estado ENUM('activo', 'inactivo', 'mantenimiento') DEFAULT 'activo',
    km_por_litro DECIMAL(10, 2) DEFAULT 8.00,
    modelo VARCHAR(100),
    anio YEAR,
    cuota_diaria DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    odometro_mantenimiento DECIMAL(12, 2),
    frecuencia_mantenimiento INT,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    FOREIGN KEY (dueno_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (chofer_id) REFERENCES choferes(id) ON DELETE SET NULL,
    INDEX (cooperativa_id),
    INDEX (dueno_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Routes
CREATE TABLE IF NOT EXISTS rutas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    vehiculo_id INT NOT NULL,
    chofer_id INT NOT NULL,
    estado ENUM('activa', 'finalizada') DEFAULT 'activa',
    alerta_combustible TINYINT(1) DEFAULT 0,
    combustible DECIMAL(10, 2) DEFAULT 0.00,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE RESTRICT,
    FOREIGN KEY (chofer_id) REFERENCES choferes(id) ON DELETE RESTRICT,
    INDEX (cooperativa_id),
    INDEX (vehiculo_id),
    INDEX (chofer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Odometer Logs
CREATE TABLE IF NOT EXISTS odometros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    ruta_id INT NOT NULL,
    tipo ENUM('inicio', 'fin') NOT NULL,
    valor DECIMAL(12, 2) NOT NULL,
    foto_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Daily Payments
CREATE TABLE IF NOT EXISTS pagos_diarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    vehiculo_id INT NOT NULL,
    chofer_id INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    monto_efectivo DECIMAL(10, 2) DEFAULT 0.00,
    monto_pagomovil DECIMAL(10, 2) DEFAULT 0.00,
    fecha DATE NOT NULL,
    estado ENUM('pendiente', 'pagado', 'validado', 'rechazado') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE RESTRICT,
    FOREIGN KEY (chofer_id) REFERENCES choferes(id) ON DELETE RESTRICT,
    UNIQUE INDEX unique_payment (vehiculo_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Reported Payments (Audit)
CREATE TABLE IF NOT EXISTS pagos_reportados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    vehiculo_id INT NOT NULL,
    chofer_id INT NOT NULL,
    id_ruta INT,
    monto FLOAT NOT NULL,
    moneda VARCHAR(10) DEFAULT 'USD',
    metodo VARCHAR(50),
    referencia VARCHAR(100),
    estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
    fecha_reportado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP NULL,
    revisado_por INT,
    notas TEXT,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE RESTRICT,
    FOREIGN KEY (chofer_id) REFERENCES choferes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Expenses
CREATE TABLE IF NOT EXISTS gastos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    vehiculo_id INT NOT NULL,
    categoria ENUM('repuestos', 'mantenimiento', 'seguro', 'otros') NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    descripcion VARCHAR(255),
    fecha DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Maintenance Items
CREATE TABLE IF NOT EXISTS mantenimiento_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    frecuencia INT NOT NULL, -- In KM
    ultimo_odometro FLOAT DEFAULT 0,
    costo DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Invitations
CREATE TABLE IF NOT EXISTS invitaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    vehiculo_id INT,
    token VARCHAR(100) UNIQUE NOT NULL,
    usado TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Notifications
CREATE TABLE IF NOT EXISTS notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    usuario_id INT,
    tipo VARCHAR(50),
    mensaje TEXT,
    leida TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

