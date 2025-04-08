const { scrapper } = require('./src/scrapperFlamenc/scrapper')
const express = require ("express")
const cors = require('cors')

const app = express()
app.use(cors())

const funcionElemento = async (req, res, next) => {
  try {
    const { elemento } = req.params
    const imgs = await scrapper(`https://trajesflamencos.eu/${elemento}`)
  return res.status(200).json(imgs)
  } catch (error) {
    return res.status(400).json("no encontradas")
  }
  }

app.use("/api/v1/:elemento", funcionElemento)

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000/");

})

scrapper('https://trajesflamencos.eu/41-vestidos-adulto')
