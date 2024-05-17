const db = require("../db");
const logger = require("../logs/loggers");

exports.addLey = (req, res) => {
  const { nombre, url, contenido } = req.body;

  const sqlLey = "INSERT INTO Leyes (nombre, url) VALUES (?, ?)";
  db.query(sqlLey, [nombre, url], (err, result) => {
    if (err) {
      logger.error(`Error al añadir la ley: ${err.message}`);
      res.status(500).send({ error: "Error al añadir la ley: " + err.message });
    } else {
      const leyId = result.insertId;

      const insertEstructura = async (items, parentId = null) => {
        for (const item of items) {
          const { tipo, texto, contenido: subContenido } = item;

          const sqlEstructura = `
            INSERT INTO EstructuraLeyes (ley_id, parent_id, tipo, contenido)
            VALUES (?, ?, ?, ?)
          `;

          try {
            const [result] = await db
              .promise()
              .query(sqlEstructura, [leyId, parentId, tipo, texto]);

            const newParentId = result.insertId;

            if (subContenido && subContenido.length > 0) {
              await insertEstructura(subContenido, newParentId);
            }
          } catch (err) {
            logger.error(
              `Error al añadir la estructura de la ley: ${err.message}`
            );
            throw new Error(err.message);
          }
        }
      };

      insertEstructura(contenido)
        .then(() => {
          logger.info(`Estructura de la ley añadida con éxito`);
          res.status(201).send({
            message: "Ley y estructura añadidas con éxito",
            id: leyId,
          });
        })
        .catch((err) => {
          res.status(500).send({
            error: "Error al añadir la estructura de la ley: " + err.message,
          });
        });
    }
  });
};

exports.getAllLeyes = async (req, res) => {
  const sql = `
    SELECT el.id, el.ley_id, el.parent_id, el.tipo, el.nombre, el.contenido, l.nombre as ley_nombre, l.url
    FROM EstructuraLeyes el
    JOIN Leyes l ON el.ley_id = l.id
    ORDER BY el.ley_id, el.parent_id, el.id;`;

  try {
    const [results] = await db.promise().query(sql);
    const leyes = buildHierarchy(results);
    res.status(200).send(leyes);
  } catch (err) {
    res
      .status(500)
      .send({ error: "Error al obtener las leyes: " + err.message });
  }
};

function buildHierarchy(items) {
  let tree = [];
  let childrenOf = {};
  items.forEach((item) => {
    let itemId = item["id"];
    let parentId = item["parent_id"] || 0;
    childrenOf[itemId] = childrenOf[itemId] || [];
    item["children"] = childrenOf[itemId];
    if (parentId != 0) {
      childrenOf[parentId] = childrenOf[parentId] || [];
      childrenOf[parentId].push(item);
    } else {
      tree.push(item);
    }
  });
  return tree;
}

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

exports.getAllLeyes = async (req, res) => {
  const sql = `
    SELECT el.id, el.ley_id, el.parent_id, el.tipo, el.nombre, el.contenido, l.nombre as ley_nombre, l.url
    FROM EstructuraLeyes el
    JOIN Leyes l ON el.ley_id = l.id
    ORDER BY el.ley_id, el.parent_id, el.id;`;

  try {
    const [results] = await db.promise().query(sql);
    const leyes = buildHierarchy(results);
    res.status(200).send(leyes);
  } catch (err) {
    res
      .status(500)
      .send({ error: "Error al obtener las leyes: " + err.message });
  }
};

function buildHierarchy(items) {
  let tree = [];
  let childrenOf = {};
  items.forEach((item) => {
    let itemId = item["id"];
    let parentId = item["parent_id"] || 0;
    childrenOf[itemId] = childrenOf[itemId] || [];
    item["children"] = childrenOf[itemId];
    if (parentId != 0) {
      childrenOf[parentId] = childrenOf[parentId] || [];
      childrenOf[parentId].push(item);
    } else {
      tree.push(item);
    }
  });
  return tree;
}

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
