const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  // Utilizar la cookie llamada 'jwt' en lugar del encabezado de autorización
  const token = req.cookies.jwt;
  if (!token) {
    return res.sendStatus(401); // No autorizado si no hay token
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.sendStatus(403); // Token inválido o expirado
    }
    req.user = decoded; // Añadir usuario decodificado a la solicitud
    next();
  });
}

module.exports = authenticateToken;
