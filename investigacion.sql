CREATE TABLE problemas (
    id_problema SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    dificultad VARCHAR(20),
    descripcion TEXT,
    restricciones TEXT
);

CREATE TABLE tecnicas (
    id_tecnica SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE experimentos (
    id_experimento SERIAL PRIMARY KEY,

    id_problema INTEGER NOT NULL,
    id_tecnica INTEGER NOT NULL,

    prompt_generado TEXT NOT NULL,
    codigo_generado TEXT NOT NULL,

    fecha_ejecucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_problema)
        REFERENCES problemas(id_problema),

    FOREIGN KEY (id_tecnica)
        REFERENCES tecnicas(id_tecnica)
);

CREATE TABLE resultados (
    id_resultado SERIAL PRIMARY KEY,

    id_experimento INTEGER UNIQUE NOT NULL,

    exactitud_funcional NUMERIC(5,2),

    maintainability_index NUMERIC(10,2),

    complejidad INTEGER,

    cognitive_complexity INTEGER,

    code_smells INTEGER,

    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_experimento)
        REFERENCES experimentos(id_experimento)
);

CREATE TABLE casos_prueba (
    id_caso_prueba SERIAL PRIMARY KEY,

    id_problema INTEGER NOT NULL,

    datos_entrada JSONB NOT NULL,

    salida_esperada JSONB NOT NULL,

    descripcion TEXT,

    FOREIGN KEY (id_problema)
        REFERENCES problemas(id_problema)
        ON DELETE CASCADE
);

CREATE TABLE ejecuciones_prueba (
    id_ejecucion_prueba SERIAL PRIMARY KEY,

    id_experimento INTEGER NOT NULL,

    id_caso_prueba INTEGER NOT NULL,

    prueba_superada BOOLEAN NOT NULL,

    tiempo_ejecucion NUMERIC(10,4),

    mensaje_error TEXT,

    FOREIGN KEY (id_experimento)
        REFERENCES experimentos(id_experimento)
        ON DELETE CASCADE,

    FOREIGN KEY (id_caso_prueba)
        REFERENCES casos_prueba(id_caso_prueba)
        ON DELETE CASCADE
);

INSERT INTO tecnicas(nombre)
VALUES
('Zero-Shot'),
('Few-Shot'),
('Chain-of-Thought'),
('Role Prompting');
