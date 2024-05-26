-- Create the database and use it
CREATE DATABASE IF NOT EXISTS MiAppTemarios;
USE MiAppTemarios;

-- Create the tables
CREATE TABLE IF NOT EXISTS Leyes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS EstructuraLeyes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ley_id INT,
    parent_id INT,
    tipo VARCHAR(255),
    contenido TEXT,
    FOREIGN KEY (ley_id) REFERENCES Leyes(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Oposiciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    url_publicacion VARCHAR(255),
    fecha_publicacion DATE,
    temario TEXT,
    fecha_inicio_instancias DATE,
    fecha_fin_instancias DATE,
    url_instancias VARCHAR(255),
    numero_plazas INT
);

CREATE TABLE IF NOT EXISTS Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_usuario VARCHAR(20),
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255)
);

-- Insert initial data into the Usuarios table
INSERT INTO Usuarios (tipo_usuario, username, password) VALUES
('admin', 'admin name', '$2a$10$pKOqYGVx6Ret89BAbkVSX.3mGiNx1uryOXH3hC6o8YVE3KJh2fhtm'),
('user', 'user name', '$2a$10$pKOqYGVx6Ret89BAbkVSX.3mGiNx1uryOXH3hC6o8YVE3KJh2fhtm');
