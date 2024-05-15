const scrapeBOE = require("../scraping/scrapingFlow");

exports.scrapeLey = async (req, res) => {
  const { url, nombreLey } = req.body;
  if (!url || !nombreLey) {
    return res
      .status(400)
      .json({ error: "URL y Nombre de Ley son requeridos" });
  }

  try {
    const data = await scrapeBOE(url, nombreLey);
    res.status(200).json({
      message: "Datos extraídos con éxito",
      data,
    });
  } catch (error) {
    console.error("Error during web scraping", error);
    res.status(500).json({ error: "Error al realizar el scraping" });
  }
};
