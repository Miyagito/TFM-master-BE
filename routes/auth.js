const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM Usuarios WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al buscar el usuario: " + err.message });
    }

    if (results.length > 0) {
      const user = results[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        const accessToken = jwt.sign(
          { userId: user.id, username: user.username, role: user.tipo_usuario },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "24h" }
        );

        // Configuración de la cookie
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 24 * 60 * 60 * 1000, // 24 horas
        });

        // Aquí se incluye el nombre de usuario y el rol en la respuesta
        res.status(200).json({
          message: "Autenticación exitosa",
          data: {
            role: user.tipo_usuario,
            username: user.username, // Incluye el nombre de usuario
          },
        });
      } else {
        res.status(401).json({ message: "Credenciales no válidas" });
      }
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  });
});

// Ruta de logout
router.post("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Sesión cerrada con éxito" });
});

router.get("/verify-session", authenticateToken, (req, res) => {
  // Si el middleware de autenticación pasa, enviar de vuelta el usuario
  res.status(200).json({ user: req.user });
});

module.exports = router;
