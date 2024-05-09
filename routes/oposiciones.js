const express = require("express");
const router = express.Router();
const oposicionesController = require("../controllers/oposicionesController");
const authenticateToken = require("../middleware/authenticateToken");

router.post("/", oposicionesController.addOposicion);
router.get("/", oposicionesController.getAllOposiciones);
router.put("/:id", authenticateToken, oposicionesController.updateOposicion);
router.delete("/:id", authenticateToken, oposicionesController.deleteOposicion);

module.exports = router;
