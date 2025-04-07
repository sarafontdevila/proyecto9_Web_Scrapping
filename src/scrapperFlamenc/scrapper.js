const puppeteer = require('puppeteer')
const fs = require ("fs")

const scrapper = async (url) => {

  const arrayImgs = []
  const browser = await puppeteer.launch({ headless: false})
  const page = await browser.newPage()
  await page.goto(url)

  const divsImg = await page.$$('a.product_img_link')
  console.log(divsImg.length)

  /*for (let i=0; i < 10; i++){ 
    const div = divsImg[i];
    const img = await div.$eval("img", (e) => e.src);
    console.log(img);*/
    
  for (let i = 0; i < Math.min(10,divsImg.length); i++) {
    const div = divsImg[i]
    try {
      const img = await div.$eval('img', (e) => e.src)
      arrayImgs.push(img)

    } catch (error) {
      console.log('No image found in this container ${i}')
    }
    
  }
  console.log(arrayImgs)
  browser.close()
  return arrayImgs
}


module.exports = { scrapper }