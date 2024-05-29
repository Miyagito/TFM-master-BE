# miapptemarios - Backend

Este es el servidor backend para la aplicación MiAppTemarios, que gestiona las oposiciones y leyes relacionadas.

## Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- npm (v6 o superior)

## Configuración Inicial

1. Clona el repositorio:

- `git clone https://github.com/Miyagito/TFM-master-BE.git`

2. Navega al directorio del proyecto:

- `cd miapptemarios`

3. Instala las dependencias de npm:

- `npm install`

4. Configura las variables de entorno:

- Copia el archivo `.env.example` a `.env` y ajusta las variables según tu entorno.

5. Ejecuta el script de configuración de la base de datos:

- `mysql -u root -p < setup.sql`

Este script creará la base de datos y las tablas necesarias.

## Ejecución del Servidor

Para iniciar el servidor, ejecuta:

- `node server.js`

El servidor debería estar accesible en `http://localhost:3000`.

## API Endpoints

Descripción básica de algunos endpoints disponibles:

- `/api/oposiciones`: Devuelve una lista de oposiciones.
- `/api/leyes`: Devuelve una lista de leyes.
