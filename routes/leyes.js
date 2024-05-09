const express = require("express");
const router = express.Router();
const leyesController = require("../controllers/leyesController");
const authenticateToken = require("../middleware/authenticateToken");

router.post("/", leyesController.addLey);
router.get("/", leyesController.getAllLeyes);
router.put("/:id", authenticateToken, leyesController.updateLey);
router.delete("/:id", authenticateToken, leyesController.deleteLey);

module.exports = router;
