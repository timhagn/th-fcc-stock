/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const request = require('request');

// Connect to DB.
mongoose.connect(
    process.env.MONGO_URI || process.env.MONGO_LOCAL,
    { useNewUrlParser: true }
);

// Issue Tracker - Schemas
const StockSchema = new Schema({
  symbol: { type: String, required: true },
  likes_per_ip: [{ type: String }],
});
const Stock = mongoose.model('Stock', StockSchema);

module.exports = function (app) {
  const lexURI = 'https://api.iextrading.com/1.0/stock/%/price';

  // Async function to Retrieve the Stock Price for a given Symbol.
  function requestStockPrice(symbol) {
    return new Promise((resolve, reject) => {
      let requestSybol  = lexURI.replace('%', symbol);
      request(requestSybol, (error, response, body) => {
        error ? reject(null) : resolve(body);
      });
    });
  }

  // Async function to Create a Book.
  // function createLike(title) {
  //   return new Promise((resolve, reject) => {
  //     let bookToSave = new Stock({ title });
  //     bookToSave.save((err, data) =>
  //         err ? reject(null) : resolve(data));
  //   });
  // }

  app.route('/api/stock-prices')
      .get(async function (req, res){
        const ip = req.clientIp;
        let price = await requestStockPrice('goog');
        res.send(price);

      });
    
};
