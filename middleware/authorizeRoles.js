function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.sendStatus(401); // No hay información de usuario
    }

    const { role } = req.user;
    if (allowedRoles.includes(role)) {
      next();
    } else {
      res.sendStatus(403); // Prohibido
    }
  };
}

module.exports = authorizeRoles;
