-- Migration: Create maintenance items table
-- Version: 2026_03_24_04
-- Description: Individual tracking for vehicle components (Oil, Tires, Brakes, etc.)

USE tu_cooperativa;

CREATE TABLE IF NOT EXISTS mantenimiento_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL, -- 'Cambio de Aceite', 'Rotación de Cauchos', etc.
    frecuencia INT NOT NULL DEFAULT 5000, -- en KM
    ultimo_odometro FLOAT DEFAULT 0, -- Lectura en la cual se hizo el último servicio
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
);

-- Migración Inicial: Mover el dato actual de vehiculos a la nueva tabla como "Servicio General"
INSERT INTO mantenimiento_items (vehiculo_id, nombre, frecuencia, ultimo_odometro)
SELECT id, 'Servicio General', frecuencia_mantenimiento, odometro_mantenimiento
FROM vehiculos;
