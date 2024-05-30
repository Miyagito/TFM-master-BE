const scrapeBOE = require("../scraping/scrapingFlow");

exports.scrapeLey = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res
      .status(400)
      .json({ error: "La URL es requerida para el scraping" });
  }

  try {
    const data = await scrapeBOE(url);
    res.status(200).json({
      message: "Datos extraídos con éxito",
      data,
    });
  } catch (error) {
    console.error("Error during web scraping", error);
    res.status(500).json({ error: "Error al realizar el scraping" });
  }
};
