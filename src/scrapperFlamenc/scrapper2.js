const puppeteer = require("puppeteer");
const fs = require("fs");

const vestidosArray = [];

const scrapper = async (url) => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();

  await page.goto(url);

  await page.setViewport({ width: 1080, height: 1024 });

  repeat(page, browser);
};

const repeat = async (page, browser) => {
  const arrayDivs = await page.$$(".product-container");

  for (const vestidoDiv of arrayDivs) {
    let precio;
    let nombre = await vestidoDiv.$eval(".a.product-name", (el) => el.textContent);
    let img = await vestidoDiv.$eval("a.product_img_link", (el) => el.src);

    try {
      price = await vestidoDiv.$eval(".product-price", (el) =>
        parseFloat(el.textContent.slice(0, el.textContent.length - 1))
      );
      const vestido = {
        nombre,
        precio,
        img,
      };
      vestidosArray.push(vestido);
    } catch (error) {
      const vestido = {
        nombre,
        img,
        stock: false,
      };
      vestidosArray.push(vestido);
    }
  }

  try {
    await page.$eval("icon-chevron-right", (el) => el.click());
    await page.waitForNavigation();
    repeat(page, browser);
  } catch (error) {
    write(vestidosArray);
    await browser.close();
  }
};

const write = (vestidosArray) => {
  fs.writeFile("vestidos.json", JSON.stringify(vestidosArray), () => {
    console.log("File written");
  });
};

module.exports = { scrapper };