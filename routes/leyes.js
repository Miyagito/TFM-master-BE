const express = require("express");
const router = express.Router();
const leyesController = require("../controllers/leyesController");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRoles = require("../middleware/authorizeRoles");

router.get("/", leyesController.getAllLeyes);
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  leyesController.addLey
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  leyesController.updateLey
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  leyesController.deleteLey
);

module.exports = router;
