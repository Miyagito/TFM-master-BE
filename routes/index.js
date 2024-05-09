const express = require("express");
const router = express.Router();

// Importa las rutas específicas
const leyesRoutes = require("./leyes");
const oposicionesRoutes = require("./oposiciones");

// Usa las rutas en el enrutador principal
router.use("/leyes", leyesRoutes);
router.use("/oposiciones", oposicionesRoutes);

module.exports = router;
