const express = require("express");
const cors = require("cors");
const db = require("./db/index");
const authRoutes = require("./routes/auth");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(authRoutes);

db.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos: ", err);
    process.exit(1); // Detiene la aplicación si no puede conectar a la base de datos
  } else {
    console.log("Conectado a la base de datos MySQL");
  }
});

// Importar rutas y usarlas
const routes = require("./routes/index");
app.use("/api", routes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("¡Algo salió mal!");
});

// Ruta básica para verificar que el servidor está funcionando
app.get("/", (req, res) => {
  res.send("Servidor Express funcionando correctamente");
});

// Escuchar en el puerto configurado
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
