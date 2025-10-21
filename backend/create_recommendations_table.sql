-- Script para crear la tabla de recomendaciones
-- Ejecutar este script en la base de datos PostgreSQL

CREATE TABLE IF NOT EXISTS recomendaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    opcion_recomendada VARCHAR(50) NOT NULL,
    puntuacion DECIMAL(5,2) NOT NULL,
    datos JSONB NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES emprendedores(id) ON DELETE CASCADE
);

-- Crear índice para mejorar las consultas por usuario
CREATE INDEX IF NOT EXISTS idx_recomendaciones_usuario_id ON recomendaciones(usuario_id);

-- Crear índice para mejorar las consultas por fecha
CREATE INDEX IF NOT EXISTS idx_recomendaciones_fecha ON recomendaciones(fecha_creacion);

-- Comentarios sobre la tabla
COMMENT ON TABLE recomendaciones IS 'Tabla para almacenar las recomendaciones de financiamiento generadas por el sistema';
COMMENT ON COLUMN recomendaciones.usuario_id IS 'ID del usuario que recibió la recomendación';
COMMENT ON COLUMN recomendaciones.opcion_recomendada IS 'Tipo de financiamiento recomendado (prestamo, capital, crowdfunding)';
COMMENT ON COLUMN recomendaciones.puntuacion IS 'Puntuación de la recomendación (0-100)';
COMMENT ON COLUMN recomendaciones.datos IS 'Datos completos de la recomendación en formato JSON';
COMMENT ON COLUMN recomendaciones.fecha_creacion IS 'Fecha y hora de creación de la recomendación';
