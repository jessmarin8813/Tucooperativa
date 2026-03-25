-- Migration: Create collection/cobranza tables
-- Version: 2026_03_24_05
-- Description: Supports Daily Fee (Cuota) and Payment Reporting (Cobranza)

USE tu_cooperativa;

-- Add Cuota Diaria to vehicles
ALTER TABLE vehiculos ADD COLUMN cuota_diaria FLOAT DEFAULT 10;

-- Table for reported payments
CREATE TABLE IF NOT EXISTS pagos_reportados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cooperativa_id INT NOT NULL,
    vehiculo_id INT NOT NULL,
    chofer_id INT NOT NULL,
    monto FLOAT NOT NULL,
    moneda VARCHAR(10) DEFAULT 'USD',
    metodo VARCHAR(50) DEFAULT 'Telegram',
    referencia VARCHAR(100),
    estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
    fecha_reportado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP NULL,
    revisado_por INT NULL,
    notas TEXT,
    FOREIGN KEY (cooperativa_id) REFERENCES cooperativas(id) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (chofer_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Table for historical Debt snapshots (optional but good for performance)
-- For now we calculate debt on the fly: (Total Days * Cuota) - (Total Approved Payments)
