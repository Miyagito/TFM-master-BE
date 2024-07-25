const express = require("express");
const router = express.Router();
const leyesController = require("../controllers/leyesController");
const scrapeController = require("../controllers/scrapeController");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRoles = require("../middleware/authorizeRoles");

router.get("/", leyesController.getAllLeyes);
router.get("/:id", leyesController.getLey);
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

router.post(
  "/scrape",
  authenticateToken,
  authorizeRoles("admin"),
  scrapeController.scrapeLey
);

module.exports = router;
