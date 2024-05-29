const db = require("../db");
const logger = require("../logs/loggers");
const Joi = require("joi");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

// Crear un objeto DOMPurify para sanitizar el HTML
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const oposicionSchema = Joi.object({
  nombre: Joi.string().required(),
  url_publicacion: Joi.string().required(),
  fecha_publicacion: Joi.date().iso().required(),
  temario: Joi.string().required(),
  fecha_inicio_instancias: Joi.date().iso().required(),
  fecha_fin_instancias: Joi.date().iso().required(),
  url_instancias: Joi.string().required(),
  numero_plazas: Joi.number().integer().min(1).required(),
});

exports.addOposicion = async (req, res) => {
  try {
    const { error, value } = oposicionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Sanitizar el contenido HTML del campo temario
    value.temario = DOMPurify.sanitize(value.temario);

    const sql = `
      INSERT INTO Oposiciones 
      (nombre, url_publicacion, fecha_publicacion, temario, fecha_inicio_instancias, fecha_fin_instancias, url_instancias, numero_plazas) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db
      .promise()
      .query(sql, [
        value.nombre,
        value.url_publicacion,
        value.fecha_publicacion,
        value.temario,
        value.fecha_inicio_instancias,
        value.fecha_fin_instancias,
        value.url_instancias,
        value.numero_plazas,
      ]);
    logger.info(`Oposición añadida con éxito, ID: ${result.insertId}`);
    res
      .status(201)
      .json({ message: "Oposición añadida con éxito", id: result.insertId });
  } catch (err) {
    logger.error(`Error al añadir la oposición: ${err.message}`);
    res
      .status(500)
      .json({ error: "Error al añadir la oposición: " + err.message });
  }
};

exports.getAllOposiciones = (req, res) => {
  const sql = "SELECT * FROM Oposiciones";
  db.query(sql, (err, results) => {
    if (err) {
      logger.error(`Error al obtener las oposiciones: ${err.message}`);
      res
        .status(500)
        .json({ error: "Error al obtener las oposiciones: " + err.message });
    } else {
      logger.info("Consulta de todas las oposiciones realizada con éxito");
      res.status(200).json(results);
    }
  });
};

exports.updateOposicion = (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    url_publicacion,
    fecha_publicacion,
    temario,
    fecha_inicio_instancias,
    fecha_fin_instancias,
    url_instancias,
    numero_plazas,
  } = req.body;

  // Sanitizar el contenido HTML del campo temario
  const sanitizedTemario = DOMPurify.sanitize(temario);

  const sql = `
    UPDATE Oposiciones SET 
    nombre = ?, 
    url_publicacion = ?, 
    fecha_publicacion = ?, 
    temario = ?, 
    fecha_inicio_instancias = ?, 
    fecha_fin_instancias = ?, 
    url_instancias = ?, 
    numero_plazas = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      nombre,
      url_publicacion,
      fecha_publicacion,
      sanitizedTemario, // Usar el temario sanitizado
      fecha_inicio_instancias,
      fecha_fin_instancias,
      url_instancias,
      numero_plazas,
      id,
    ],
    (err, result) => {
      if (err) {
        logger.error(`Error al actualizar la oposición: ${err.message}`);
        res
          .status(500)
          .json({ error: "Error al actualizar la oposición: " + err.message });
      } else if (result.affectedRows === 0) {
        logger.warn(`Oposición no encontrada, ID: ${id}`);
        res.status(404).json({ message: "Oposición no encontrada" });
      } else {
        logger.info(`Oposición actualizada con éxito, ID: ${id}`);
        res.status(200).json({ message: "Oposición actualizada con éxito" });
      }
    }
  );
};

exports.deleteOposicion = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM Oposiciones WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      logger.error(`Error al eliminar la oposición: ${err.message}`);
      res
        .status(500)
        .json({ error: "Error al eliminar la oposición: " + err.message });
    } else if (result.affectedRows === 0) {
      logger.warn(`Oposición no encontrada al intentar eliminar, ID: ${id}`);
      res.status(404).json({ message: "Oposición no encontrada" });
    } else {
      logger.info(`Oposición eliminada con éxito, ID: ${id}`);
      res.status(200).json({ message: "Oposición eliminada con éxito" });
    }
  });
};
