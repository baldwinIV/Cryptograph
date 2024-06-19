const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const {
  getCoinInfo,
  getMarketCapInfos,
  getPriceData
} = require('./data/configData');

const PORT = 8080;
let coinInfos = null;

getCoinInfo().then(result => {
  coinInfos = result;
});

setInterval(() => {
  getCoinInfo().then(result => {
    coinInfos = result;
  });
}, 60 * 60 * 1000);

const app = express();
app.use(express.static('admin', { extensions: ['html', 'js'] }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    method: 'GET'
  })
);

app.get('/coin-info/:code', (req, res) => {
  console.log(req.params);
  const code = req.params.code;
  if (coinInfos === null) {
    res.status(503).end();
    return;
  }
  if (!code || !coinInfos[code]) {
    res.status(404).end();
    return;
  }
  res.status(200).send(coinInfos[code]);
});

app.get('/market-cap-info', async (req, res) => {
  const marketCapInfos = await getMarketCapInfos(coinInfos);
  if (marketCapInfos === null) {
    res.status(503).end();
    return;
  }
  res.status(200).send(marketCapInfos);
});

app.get('/market-price-info', async (req, res) => {
  const priceData = await getPriceData(coinInfos);
  if (priceData === null) {
    res.status(503).end();
    return;
  }
  res.status(200).send(priceData);
});

app.get('/admin', function (req, res) {
  const filePath = path.join(__dirname, 'admin', 'index.html');
  res.status(200).sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`server listening port ${PORT}`);
});
