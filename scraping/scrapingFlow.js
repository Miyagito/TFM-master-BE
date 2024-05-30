const puppeteer = require("puppeteer");

async function scrapeBOE(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  try {
    const waitForSelectorIgnoreError = async (selector) => {
      try {
        await page.waitForSelector(selector, { visible: true });
      } catch (error) {
        return null; // Devuelve null en caso de error
      }
    };

    await Promise.race([
      waitForSelectorIgnoreError(".documento-tit"),
      waitForSelectorIgnoreError(".documento-subtit"),
      waitForSelectorIgnoreError(
        'a[target="_blank"][title="Abre el PDF en una nueva ventana"]'
      ),
    ]);

    const isLoaded = await page.evaluate(() => {
      const tit = document.querySelector(".documento-tit");
      const subtit = document.querySelector(".documento-subtit");
      const pdfLink = document.querySelector(
        'a[target="_blank"][title="Abre el PDF en una nueva ventana"]'
      );
      return !!tit || !!subtit || !!pdfLink; // Devuelve true si alguno existe
    });

    if (!isLoaded) {
      throw new Error("Ningún elemento necesario se cargó correctamente.");
    }

    // Extraer el nombre de la ley y su estructura documental
    const ley = await page.evaluate(() => {
      const nombreLey = document.querySelector(".documento-tit")?.innerText;
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

      return { nombreLey, estructura }; // Devolver tanto el nombre como la estructura
    });

    await browser.close();
    return ley;
  } catch (error) {
    console.error("Error durante el scraping:", error);
    await browser.close();
    throw error;
  }
}

module.exports = scrapeBOE;
