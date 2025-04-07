const puppeteer = require('puppeteer');
const fs = require('fs');

const scrapper = async (url) => {
  const products = [];
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);

  let hasNextPage = true;
  let pageCounter = 1;

  while (hasNextPage) {
    console.log(`Procesando página ${pageCounter}...`);

    // Seleccionar todos los contenedores de productos en la página actual
    const productContainers = await page.$$('.product-container');
    console.log(`Encontrados ${productContainers.length} productos en esta página`);

    // Extraer información de cada producto
    for (let i = 0; i < productContainers.length; i++) {
      const container = productContainers[i];
      try {
        // Extraer la imagen
        const img = await container.$eval('.product-image-container img', (e) => e.src);
        
        // Extraer el nombre del producto
        const name = await container.$eval('.product-name', (e) => e.innerText.trim());
        
        // Extraer el precio
        const price = await container.$eval('span[itemprop="price"]', (e) => e.innerText.trim());
        
        products.push({
          name,
          price,
          img
        });
      } catch (error) {
        console.log(`Error al procesar el producto ${i} en página ${pageCounter}: ${error.message}`);
      }
    }

    // Comprobar si hay una página siguiente
    try {
      // Buscar el botón "siguiente" o el enlace a la siguiente página
      // Ajusta este selector según la estructura del sitio web
      const nextButton = await page.$('li.pagination_next:not(.disabled) a, a.next, a[rel="next"]');
      
      if (nextButton) {
        // Hacer clic en el botón de siguiente página
        await nextButton.click();
        // Esperar a que la página se cargue
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        // Dar tiempo adicional para cargar todos los elementos
        await page.waitForTimeout(2000);
        pageCounter++;
      } else {
        hasNextPage = false;
        console.log('Llegamos a la última página');
      }
    } catch (error) {
      hasNextPage = false;
      console.log(`No se pudo navegar a la siguiente página: ${error.message}`);
    }
  }

  // Guardar los datos en un archivo JSON
  fs.writeFileSync('productos_completo.json', JSON.stringify(products, null, 2));
  console.log(`Proceso completado. Se han guardado ${products.length} productos en productos_completo.json`);

  await browser.close();
  return products;
};

module.exports = { scrapper };