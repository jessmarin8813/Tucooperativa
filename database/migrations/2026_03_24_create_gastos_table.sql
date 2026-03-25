-- Migration: Create Gastos Table
-- Version: 2026_03_24_01
-- Description: Tracking operational expenses for vehicles in TuCooperativa SaaS

USE tu_cooperativa;

CREATE TABLE IF NOT EXISTS gastos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    vehiculo_id INT, -- NULL means overhead/general cooperative expense
    categoria ENUM('repuestos', 'mantenimiento', 'seguro', 'otros') NOT NULL DEFAULT 'otros',
    monto DECIMAL(10, 2) NOT NULL,
    descripcion VARCHAR(255),
    fecha DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE SET NULL,
    INDEX (cooperativa_id),
    INDEX (vehiculo_id),
    INDEX (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
