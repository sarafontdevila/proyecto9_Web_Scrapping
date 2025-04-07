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

    const productContainers = await page.$$('.product-container');
    console.log(`Encontrados ${productContainers.length} productos en esta página`);

  
    for (let i = 0; i < productContainers.length; i++) {
      const container = productContainers[i];
      try {
       
        const img = await container.$eval('.product-image-container img', (e) => e.src);
        const name = await container.$eval('.product-name', (e) => e.innerText.trim());
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

  fs.writeFileSync('productos.json', JSON.stringify(products, null, 2));
  console.log(`Proceso completado. Se han guardado ${products.length} productos en el archivo de productos.json`);

  await browser.close();
  return products;
};

module.exports = { scrapper };