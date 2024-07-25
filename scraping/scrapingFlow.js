const puppeteer = require("puppeteer");

async function scrapeBOE(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  try {
    const ley = await page.evaluate(() => {
      const tituloElement = document.querySelector(".documento-tit");
      const nombreLey = tituloElement
        ? tituloElement.firstChild.textContent.trim()
        : "";
      const estructura = [];
      const stack = [];

      // Función para encontrar el texto correspondiente a un dt específico
      const getTextForDt = (dtText) => {
        const dtElement = Array.from(document.querySelectorAll("dt")).find(
          (dt) => dt.textContent.trim() === dtText
        );
        if (dtElement) {
          const ddElement = dtElement.nextElementSibling;
          return ddElement ? ddElement.textContent.trim() : "No disponible";
        }
        return "No disponible";
      };

      // Función para encontrar el href correspondiente a un dt específico
      const getHrefForDt = (dtText) => {
        const dtElement = Array.from(document.querySelectorAll("dt")).find(
          (dt) => dt.textContent.trim() === dtText
        );
        if (dtElement) {
          const ddElement = dtElement.nextElementSibling;
          const aElement = ddElement ? ddElement.querySelector("a") : null;
          return aElement ? aElement.href : "No disponible";
        }
        return "No disponible";
      };

      const publicadoEn = getTextForDt("Publicado en:");
      const seccion = getTextForDt("Sección:");
      const departamento = getTextForDt("Departamento:");
      const referencia = getTextForDt("Referencia:");
      const permalink = getHrefForDt("Permalink ELI:");
      // Asegurarse de capturar elementos del preámbulo correctamente
      const elementos = document.querySelectorAll(
        "#DOdocText h4, #DOdocText .centro_redonda, #DOdocText p:not(.centro_redonda), .titulo, .titulo_num, .titulo_tit, .capitulo_num, .capitulo_tit, .articulo"
      );

      elementos.forEach((elemento) => {
        const tipo = elemento.matches("#DOdocText h4")
          ? "titulo_preambulo"
          : elemento.matches("#DOdocText .centro_redonda")
          ? "centro_redonda"
          : elemento.matches("#DOdocText p")
          ? "parrafo"
          : elemento.className || "parrafo";

        const texto = elemento.innerText;
        const nuevoElemento = { tipo, texto, children: [] };

        function debeSerHijo(parentType, childType) {
          const hierarchy = {
            preambulo: ["titulo_preambulo", "centro_redonda", "parrafo"],
            titulo_preambulo: ["centro_redonda", "parrafo"],
            centro_redonda: ["parrafo"],
            titulo: ["articulo", "capitulo_num", "capitulo_tit"],
            titulo_num: [
              "capitulo_num",
              "titulo_tit",
              "capitulo_tit",
              "articulo",
            ],
            capitulo_num: ["capitulo_tit", "articulo"],
            capitulo_tit: ["articulo"],
            articulo: ["parrafo", "parrafo_2"],
          };
          return hierarchy[parentType]?.includes(childType);
        }

        while (
          stack.length > 0 &&
          !debeSerHijo(stack[stack.length - 1].tipo, tipo)
        ) {
          stack.pop();
        }

        if (stack.length > 0) {
          stack[stack.length - 1].children.push(nuevoElemento);
        } else {
          estructura.push(nuevoElemento);
        }
        stack.push(nuevoElemento);
      });

      return {
        nombreLey,
        estructura,
        metadatos: {
          seccion,
          departamento,
          referencia,
          permalink,
          publicadoEn,
        },
      };
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
