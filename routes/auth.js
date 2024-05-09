const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/login", (req, res) => {
  // Aquí debes verificar las credenciales del usuario realmente, esto es solo un ejemplo
  const { username, password } = req.body;

  if (username === "admin" && password === "password") {
    // Debes cambiar esto por una verificación real en producción
    const user = { name: username };

    // Generar un token JWT
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "24h",
    });
    res.json({ accessToken });
  } else {
    res.status(401).send("Credenciales no válidas");
  }
});

module.exports = router;
