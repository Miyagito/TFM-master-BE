const express = require("express");
const router = express.Router();
const oposicionesController = require("../controllers/oposicionesController");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRoles = require("../middleware/authorizeRoles");

router.get("/", oposicionesController.getAllOposiciones);
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  oposicionesController.addOposicion
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  oposicionesController.updateOposicion
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  oposicionesController.deleteOposicion
);

module.exports = router;
