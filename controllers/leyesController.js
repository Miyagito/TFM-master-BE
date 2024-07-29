const db = require("../db");
const logger = require("../logs/loggers");

exports.addLey = (req, res) => {
  const { nombre, url, contenido, metadatos } = req.body;
  const { publicadoEn, seccion, departamento, referencia, permalink } =
    metadatos;

  // Verificar si la ley ya existe
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
      // La ley ya existe, actualizar la URL y sus metadatos
      const leyId = results[0].id;
      const sqlUpdate =
        "UPDATE Leyes SET url = ?, publicadoEn = ?, seccion = ?, departamento = ?, referencia = ?, permalink = ? WHERE id = ?";
      db.query(
        sqlUpdate,
        [url, publicadoEn, seccion, departamento, referencia, permalink, leyId],
        (err) => {
          if (err) {
            logger.error(`Error al actualizar la ley: ${err.message}`);
            return res
              .status(500)
              .send({ error: "Error al actualizar la ley: " + err.message });
          }
          updateEstructuraLey(leyId, contenido, res); // Actualizar la estructura de la ley
        }
      );
    } else {
      // La ley no existe, insertar nueva ley
      const sqlInsert =
        "INSERT INTO Leyes (nombre, url, publicadoEn, seccion, departamento, referencia, permalink) VALUES (?, ?, ?, ?, ?, ?, ?)";
      db.query(
        sqlInsert,
        [
          nombre,
          url,
          publicadoEn,
          seccion,
          departamento,
          referencia,
          permalink,
        ],
        (err, result) => {
          if (err) {
            logger.error(`Error al añadir la ley: ${err.message}`);
            return res
              .status(500)
              .send({ error: "Error al añadir la ley: " + err.message });
          }
          const leyId = result.insertId;
          updateEstructuraLey(leyId, contenido, res); // Insertar la nueva estructura de la ley
        }
      );
    }
  });
};

function updateEstructuraLey(leyId, contenido, res) {
  deleteEstructuraRecursive(leyId)
    .then(() => {
      insertarEstructura(db, leyId, contenido, null, 0)
        .then(() => {
          logger.info(`Estructura de la ley ${leyId} actualizada con éxito`);
          res.status(201).send({
            message: "Ley y estructura actualizadas con éxito",
            id: leyId,
          });
        })
        .catch((err) => {
          logger.error(
            `Error al insertar la nueva estructura de la ley: ${err.message}`
          );
          res.status(500).send({
            error:
              "Error al actualizar la estructura de la ley: " + err.message,
          });
        });
    })
    .catch((deleteErr) => {
      logger.error(
        `Error al eliminar la estructura existente de la ley: ${deleteErr.message}`
      );
      res.status(500).send({
        error:
          "Error al eliminar la estructura de la ley: " + deleteErr.message,
      });
    });
}

async function deleteEstructuraRecursive(leyId) {
  try {
    const childrenSql =
      "SELECT id FROM EstructuraLeyes WHERE parent_id IN (SELECT id FROM EstructuraLeyes WHERE ley_id = ?)";
    const [children] = await db.promise().query(childrenSql, [leyId]);
    if (children.length > 0) {
      await Promise.all(
        children.map((child) => deleteEstructuraRecursive(child.id))
      );
    }
    const deleteSql = "DELETE FROM EstructuraLeyes WHERE ley_id = ?";
    await db.promise().query(deleteSql, [leyId]);
  } catch (error) {
    logger.error(
      `Error al eliminar estructura de ley recursivamente: ${error.message}`
    );
    throw error;
  }
}

function insertarEstructura(db, leyId, elementos, parentId = null, nivel = 0) {
  // Convertir cada iteración en una promesa y usar Promise.all para asegurar que todas las promesas se resuelvan antes de continuar
  return Promise.all(
    elementos.map(async (elemento) => {
      const { tipo, texto, children } = elemento;
      const sql =
        "INSERT INTO EstructuraLeyes (ley_id, parent_id, tipo, contenido, nivel) VALUES (?, ?, ?, ?, ?)";
      try {
        const [result] = await db
          .promise()
          .query(sql, [leyId, parentId, tipo, texto, nivel]);
        const newParentId = result.insertId;
        if (children && children.length > 0) {
          return insertarEstructura(
            db,
            leyId,
            children,
            newParentId,
            nivel + 1
          ); // Incremento del nivel para sub-elementos
        }
      } catch (error) {
        logger.error(
          `Error al insertar estructura de la ley: ${error.message}`
        );
        throw error; // Propagación del error para manejo centralizado
      }
    })
  );
}

exports.getAllLeyes = async (req, res) => {
  const sql = `
  SELECT id, nombre, url, publicadoEn, seccion, departamento, referencia, permalink
  FROM Leyes
  ORDER BY id;
`;

  try {
    const [results] = await db.promise().query(sql);
    res.status(200).send(results);
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

function buildHierarchy(elements) {
  let nodeMap = {};
  let rootElements = [];
  let lastRootNode = null;

  elements.forEach((element) => {
    element.children = [];
    nodeMap[element.id] = element;

    if (element.parent_id) {
      if (nodeMap[element.parent_id]) {
        nodeMap[element.parent_id].children.push(element);
      }
    } else {
      // Manejo especial para elementos con parent_id NULL que no son raíz
      if (lastRootNode) {
        lastRootNode.children.push(element);
      } else {
        rootElements.push(element);
        lastRootNode = element; // Actualizar el último nodo raíz encontrado
      }
    }
  });

  return rootElements;
}

exports.getLey = async (req, res) => {
  const { id } = req.params; // ID de la ley a buscar

  try {
    // Consulta para obtener todos los elementos de la estructura de la ley, ordenados por nivel y parent_id
    const query = `
      SELECT * FROM EstructuraLeyes WHERE ley_id = ? ORDER BY nivel ASC, parent_id ASC, id ASC
    `;
    const [elements] = await db.promise().query(query, [id]);

    if (elements.length === 0) {
      return res
        .status(404)
        .send({ message: "No se encontró la ley con el ID proporcionado" });
    }

    // Función para reconstruir la jerarquía
    const leyStructure = buildHierarchy(elements);

    res.status(200).json({
      leyId: id,
      estructura: leyStructure,
    });
  } catch (error) {
    console.error(
      `Error al recuperar la estructura de la ley: ${error.message}`
    );
    res.status(500).send({
      error: "Error al recuperar la estructura de la ley: " + error.message,
    });
  }
};

function buildHierarchy(elements) {
  const nodeMap = {};
  const rootElements = [];

  elements.forEach((element) => {
    const { id, parent_id, tipo, contenido } = element;
    if (!nodeMap[id]) {
      nodeMap[id] = { id, tipo, contenido, children: [] };
    }

    if (parent_id) {
      if (!nodeMap[parent_id]) {
        nodeMap[parent_id] = { children: [] };
      }
      nodeMap[parent_id].children.push(nodeMap[id]);
    } else {
      rootElements.push(nodeMap[id]);
    }
  });

  return rootElements;
}

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
