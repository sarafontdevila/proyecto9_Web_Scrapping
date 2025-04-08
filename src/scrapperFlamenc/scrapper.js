const puppeteer = require('puppeteer');
const fs = require('fs');

const scrapper = async (url) => {
  const products = [];
  const browser = await puppeteer.launch({ headless: false});
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
    try {
      const nextButton = await page.$('li.pagination_next:not(.disabled) a, #pagination_next_bottom a');
      console.log('Next button:', nextButton);
      
      if (nextButton) {
        await nextButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 2000))
        pageCounter++;
      } else {
        console.log('No next button found. Assuming last page.');
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

const url = 'https://trajesflamencos.eu/vestidos-adulto';

/*scrapper(url)
  .then(products => {
    console.log(`Scraping finalizado. Se obtuvieron ${products.length} productos.`);
  })
  .catch(error => {
    console.error('Error durante el scraping:', error);
  });*/


module.exports = { scrapper };

