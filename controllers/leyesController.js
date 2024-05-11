const db = require("../db");
const logger = require("../logs/loggers");

exports.addLey = (req, res) => {
  const { nombre, url, contenido } = req.body;
  const sql = "INSERT INTO Leyes (nombre, url, contenido) VALUES (?, ?, ?)";
  db.query(sql, [nombre, url, contenido], (err, result) => {
    if (err) {
      logger.error(`Error al añadir la ley: ${err.message}`);
      res.status(500).send({ error: "Error al añadir la ley: " + err.message });
    } else {
      logger.info(`Ley añadida con éxito, ID: ${result.insertId}`);
      res
        .status(201)
        .send({ message: "Ley añadida con éxito", id: result.insertId });
    }
  });
};

exports.getAllLeyes = (req, res) => {
  const sql = "SELECT * FROM Leyes";
  db.query(sql, (err, results) => {
    if (err) {
      logger.error(`Error al obtener las leyes: ${err.message}`);
      res
        .status(500)
        .send({ error: "Error al obtener las leyes: " + err.message });
    } else {
      logger.info("Consulta de todas las leyes realizada con éxito");
      res.status(200).send(results);
    }
  });
};

exports.updateLey = (req, res) => {
  const { id } = req.params;
  const { nombre, url, contenido } = req.body;
  const sql =
    "UPDATE Leyes SET nombre = ?, url = ?, contenido = ? WHERE id = ?";
  db.query(sql, [nombre, url, contenido, id], (err, result) => {
    if (err) {
      logger.error(`Error al actualizar la ley: ${err.message}`);
      res
        .status(500)
        .send({ error: "Error al actualizar la ley: " + err.message });
    } else if (result.affectedRows === 0) {
      logger.warn(`Ley no encontrada, ID: ${id}`);
      res.status(404).send({ message: "Ley no encontrada" });
    } else {
      logger.info(`Ley actualizada con éxito, ID: ${id}`);
      res.status(200).send({ message: "Ley actualizada con éxito" });
    }
  });
};

exports.deleteLey = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM Leyes WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      logger.error(`Error al eliminar la ley: ${err.message}`);
      res
        .status(500)
        .send({ error: "Error al eliminar la ley: " + err.message });
    } else if (result.affectedRows === 0) {
      logger.warn(`Ley no encontrada al intentar eliminar, ID: ${id}`);
      res.status(404).send({ message: "Ley no encontrada" });
    } else {
      logger.info(`Ley eliminada con éxito, ID: ${id}`);
      res.status(200).send({ message: "Ley eliminada con éxito" });
    }
  });
};
