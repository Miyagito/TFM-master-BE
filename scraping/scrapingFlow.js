const puppeteer = require("puppeteer");

async function scrapeBOE(url, nombreLey) {
  const browser = await puppeteer.launch({ headless: false }); // Modo no headless para visualizar el navegador
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  try {
    await page.waitForSelector("#docBOE", { visible: true });
    await page.type("#docBOE", nombreLey);
    await page.waitForSelector('input[type="submit"][value="Buscar"]', {
      visible: true,
    });
    await page.click('input[type="submit"][value="Buscar"]');
    await page.waitForNavigation({
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Esperar que los resultados estén visibles
    await page.waitForSelector("li.resultado-busqueda", { visible: true });

    // Evaluar los resultados para encontrar el enlace correcto
    const resultUrl = await page.evaluate((leyBuscada) => {
      const items = Array.from(
        document.querySelectorAll("li.resultado-busqueda")
      );
      for (let item of items) {
        const descripcion = item.querySelector("p")?.innerText;
        if (descripcion && descripcion.includes(leyBuscada)) {
          const link = item.querySelector("a");
          return link ? link.href : null;
        }
      }
      return null;
    }, nombreLey);

    if (resultUrl) {
      await page.goto(resultUrl, { waitUntil: "networkidle2" });

      // Extraer información del documento de forma estructurada
      const ley = await page.evaluate(() => {
        const estructura = [];
        const elementos = document.querySelectorAll(
          ".titulo, .titulo_num, .titulo_tit, .capitulo_num, .capitulo_tit, .articulo"
        );

        elementos.forEach((elemento) => {
          const tipo = elemento.className;
          const texto = elemento.innerText;
          const contenido = [];

          let siguienteElemento = elemento.nextElementSibling;

          while (
            siguienteElemento &&
            (siguienteElemento.className === "parrafo" ||
              siguienteElemento.className === "parrafo_2")
          ) {
            contenido.push({
              tipo: siguienteElemento.className,
              texto: siguienteElemento.innerText,
            });
            siguienteElemento = siguienteElemento.nextElementSibling;
          }

          estructura.push({ tipo, texto, contenido });
        });

        return estructura;
      });

      await browser.close();
      return ley;
    } else {
      throw new Error("No se encontró el documento correspondiente.");
    }
  } catch (error) {
    console.error("Error durante el scraping:", error);
    await browser.close();
    throw error;
  }
}

module.exports = scrapeBOE;
