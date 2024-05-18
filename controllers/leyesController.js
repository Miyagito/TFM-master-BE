const db = require("../db");
const logger = require("../logs/loggers");

exports.addLey = (req, res) => {
  const { nombre, url, contenido } = req.body;

  // Primero verificar si la ley ya existe
  const sqlExist = "SELECT id FROM Leyes WHERE nombre = ?";
  db.query(sqlExist, [nombre], (err, results) => {
    if (err) {
      logger.error(
        `Error al verificar la existencia de la ley: ${err.message}`
      );
      return res
        .status(500)
        .send({ error: "Error al verificar la ley: " + err.message });
    }

    if (results.length > 0) {
      // La ley ya existe, actualizarla
      const leyId = results[0].id;
      const sqlUpdate = "UPDATE Leyes SET url = ? WHERE id = ?";
      db.query(sqlUpdate, [url, leyId], (err, result) => {
        if (err) {
          logger.error(`Error al actualizar la ley: ${err.message}`);
          return res
            .status(500)
            .send({ error: "Error al actualizar la ley: " + err.message });
        }
        updateEstructuraLey(leyId, contenido, res);
      });
    } else {
      // La ley no existe, insertar nueva ley
      const sqlInsert = "INSERT INTO Leyes (nombre, url) VALUES (?, ?)";
      db.query(sqlInsert, [nombre, url], (err, result) => {
        if (err) {
          logger.error(`Error al añadir la ley: ${err.message}`);
          return res
            .status(500)
            .send({ error: "Error al añadir la ley: " + err.message });
        }
        const leyId = result.insertId;
        updateEstructuraLey(leyId, contenido, res);
      });
    }
  });
};

function updateEstructuraLey(leyId, contenido, res) {
  const insertEstructura = async (items, parentId = null) => {
    for (const item of items) {
      const { tipo, texto, contenido: subContenido } = item;
      const sqlEstructura =
        "INSERT INTO EstructuraLeyes (ley_id, parent_id, tipo, contenido) VALUES (?, ?, ?, ?)";

      try {
        const [result] = await db
          .promise()
          .query(sqlEstructura, [leyId, parentId, tipo, texto]);
        const newParentId = result.insertId;

        if (subContenido && subContenido.length > 0) {
          await insertEstructura(subContenido, newParentId);
        }
      } catch (err) {
        logger.error(`Error al añadir la estructura de la ley: ${err.message}`);
        throw new Error(err.message);
      }
    }
  };

  insertEstructura(contenido)
    .then(() => {
      logger.info(`Estructura de la ley actualizada con éxito`);
      res.status(201).send({
        message: "Ley y estructura actualizadas con éxito",
        id: leyId,
      });
    })
    .catch((err) => {
      res.status(500).send({
        error: "Error al actualizar la estructura de la ley: " + err.message,
      });
    });
}

exports.getAllLeyes = async (req, res) => {
  const sql = `
    SELECT el.id, el.ley_id, el.parent_id, el.tipo, el.contenido, l.nombre as ley_nombre, l.url
    FROM EstructuraLeyes el
    JOIN Leyes l ON el.ley_id = l.id
    ORDER BY el.ley_id, el.parent_id, el.id;
  `;

  try {
    const [results] = await db.promise().query(sql);
    const leyes = buildHierarchy(results);
    res.status(200).send(leyes);
  } catch (err) {
    logger.error(`Error al obtener las leyes: ${err.message}`);
    res
      .status(500)
      .send({ error: "Error al obtener las leyes: " + err.message });
  }
};

function buildHierarchy(items) {
  const leyesMap = new Map();

  items.forEach((item) => {
    const leyId = item.ley_id;
    const ley = leyesMap.get(leyId) || {
      id: leyId,
      nombre: item.ley_nombre,
      url: item.url,
      contenido: [],
    };

    const node = {
      id: item.id,
      tipo: item.tipo,
      contenido: item.contenido,
      children: [],
    };

    if (item.parent_id) {
      const parentNode = findNodeById(ley.contenido, item.parent_id);
      if (parentNode) {
        parentNode.children.push(node);
      }
    } else {
      ley.contenido.push(node);
    }

    leyesMap.set(leyId, ley);
  });

  return Array.from(leyesMap.values());
}

function findNodeById(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const found = findNodeById(node.children, id);
    if (found) {
      return found;
    }
  }
  return null;
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

async function deleteEstructuraRecursive(leyId) {
  let hasMore = true;

  while (hasMore) {
    const leavesResult = await db.promise().query(
      `
      SELECT id FROM EstructuraLeyes
      WHERE ley_id = ? AND id NOT IN (SELECT parent_id FROM EstructuraLeyes WHERE parent_id IS NOT NULL)
    `,
      [leyId]
    );

    const leavesIds = leavesResult[0].map((leaf) => leaf.id);

    if (leavesIds.length === 0) {
      hasMore = false; // No more leaves to delete, break the loop
    } else {
      await db.promise().query(
        `
        DELETE FROM EstructuraLeyes WHERE id IN (?)
      `,
        [leavesIds]
      );
    }
  }
}

exports.deleteLey = async (req, res) => {
  const { id } = req.params;

  try {
    await deleteEstructuraRecursive(id); // First, delete all child nodes

    const deleteResult = await db
      .promise()
      .query("DELETE FROM Leyes WHERE id = ?", [id]);
    if (deleteResult[0].affectedRows === 0) {
      res.status(404).send({ message: "Ley no encontrada" });
    } else {
      res.status(200).send({ message: "Ley eliminada con éxito" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ error: "Error al eliminar la ley: " + error.message });
  }
};
