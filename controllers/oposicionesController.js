const db = require("../db");

exports.addOposicion = (req, res) => {
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

  const sql = `
    INSERT INTO Oposiciones 
    (nombre, url_publicacion, fecha_publicacion, temario, fecha_inicio_instancias, fecha_fin_instancias, url_instancias, numero_plazas) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      nombre,
      url_publicacion,
      fecha_publicacion,
      temario,
      fecha_inicio_instancias,
      fecha_fin_instancias,
      url_instancias,
      numero_plazas,
    ],
    (err, result) => {
      if (err) {
        res
          .status(500)
          .json({ error: "Error al añadir la oposición: " + err.message });
      } else {
        res.status(201).json({
          message: "Oposición añadida con éxito",
          id: result.insertId,
        });
      }
    }
  );
};

exports.getAllOposiciones = (req, res) => {
  const sql = "SELECT * FROM Oposiciones";
  db.query(sql, (err, results) => {
    if (err) {
      res
        .status(500)
        .json({ error: "Error al obtener las oposiciones: " + err.message });
    } else {
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
      temario,
      fecha_inicio_instancias,
      fecha_fin_instancias,
      url_instancias,
      numero_plazas,
      id,
    ],
    (err, result) => {
      if (err) {
        res
          .status(500)
          .json({ error: "Error al actualizar la oposición: " + err.message });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ message: "Oposición no encontrada" });
      } else {
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
      res
        .status(500)
        .json({ error: "Error al eliminar la oposición: " + err.message });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: "Oposición no encontrada" });
    } else {
      res.status(200).json({ message: "Oposición eliminada con éxito" });
    }
  });
};
