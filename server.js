const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser"); // Asegúrate de tener esto
const db = require("./db/index");
const authRoutes = require("./routes/auth");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Configuración correcta de CORS para aceptar cookies
app.use(
  cors({
    origin: "http://localhost:3001", // El cliente React
    credentials: true, // Para aceptar y enviar cookies
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(authRoutes);

db.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos: ", err);
    process.exit(1);
  } else {
    console.log("Conectado a la base de datos MySQL");
  }
});

// Importar y usar rutas adicionales
const routes = require("./routes/index");
app.use("/api", routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("¡Algo salió mal!");
});

app.get("/", (req, res) => {
  res.send("Servidor Express funcionando correctamente");
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
