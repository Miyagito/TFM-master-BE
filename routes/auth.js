const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Buscar el usuario en la base de datos
  const sql = "SELECT * FROM Usuarios WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al buscar el usuario: " + err.message });
    }

    if (results.length > 0) {
      const user = results[0];
      // Verificar la contraseña (asumiendo que la contraseña está hasheada en la DB)
      const validPassword = await bcrypt.compare(password, user.password);

      if (validPassword) {
        // Generar el token JWT incluyendo el tipo de usuario
        const accessToken = jwt.sign(
          { userId: user.id, username: user.username, role: user.tipo_usuario },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "24h" }
        );

        res.json({ accessToken });
      } else {
        res.status(401).send("Credenciales no válidas");
      }
    } else {
      res.status(404).send("Usuario no encontrado");
    }
  });
});

module.exports = router;
