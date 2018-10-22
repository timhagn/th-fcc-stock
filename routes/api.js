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

// Stock Checker - Schemas
const StockSchema = new Schema({
  symbol: { type: String, required: true },
  likes_per_ip: [{ type: String }],
});
const Stock = mongoose.model('Stock', StockSchema);

module.exports = function (app) {
  // Stock retrieval URI for iextrading.com.
  const iexURI = 'https://api.iextrading.com/1.0/stock/%/price';

  // Async function to Retrieve the Stock Price for a given Symbol.
  function requestStockPrice(symbol) {
    return new Promise((resolve, reject) => {
      let requestSybol  = iexURI.replace('%', symbol);
      request(requestSybol, (error, response, body) => {
        error ? reject(null) : resolve(body);
      });
    });
  }

  // Async function to find a Stock by symbol.
  function findStock(symbol) {
    return new Promise((resolve, reject) => {
      Stock.findOne(
          {symbol},
          (err, stock) => err ? reject(null) : resolve(stock)
      );
    });
  }

  // Async function to Create a Stock.
  function createStock(symbol, ip) {
    return new Promise((resolve, reject) => {
      let stockToSave = new Stock({ symbol });
      stockToSave.likes_per_ip.push(ip);
      stockToSave.save((err, stock) =>
          err ? reject(null) : resolve(stock));
    });
  }

  app.route('/api/stock-prices')
      .get(async function (req, res){
        let requestedStock = req.query.stock;
        let like = req.query.like;
        let ip = req.clientIp;
        if (requestedStock) {
          let stockObject = {};
          // Single stock?
          if (!Array.isArray(requestedStock)) {
            let price = await requestStockPrice(requestedStock);
            if (price) {
              let savedStock = await findStock(requestedStock);
              // Like? Then save once per ip.
              if (like === 'true') {
                if (!savedStock || savedStock &&
                    savedStock.likes_per_ip &&
                    !savedStock.likes_per_ip.includes(ip)) {
                  savedStock = await createStock(requestedStock, ip);
                }
              }
              stockObject.stockData = {
                stock: requestedStock.toUpperCase(),
                price: price,
                likes: Number(savedStock &&
                    savedStock.likes_per_ip &&
                    savedStock.likes_per_ip.includes(ip)) || 0
              };
              res.json(stockObject);
            }
            else {
              res.send('error retrieving' + requestedStock);
            }
          }
          // The same with two stocks.
          else {
            let price1 = await requestStockPrice(requestedStock[0]);
            let price2 = await requestStockPrice(requestedStock[1]);
            if (price1 && price2) {
              let savedStock1 = await findStock(requestedStock[0]);
              let savedStock2 = await findStock(requestedStock[1]);
              // Like? Then try to save for each stock.
              if (like === 'true') {
                if (!savedStock1 || savedStock1 &&
                    savedStock1.likes_per_ip &&
                    !savedStock1.likes_per_ip.includes(ip)) {
                  savedStock1 = await createStock(requestedStock[0], ip);
                }
                if (!savedStock2 || savedStock2 &&
                    savedStock2.likes_per_ip &&
                    !savedStock2.likes_per_ip.includes(ip)) {
                  savedStock2 = await createStock(requestedStock[1], ip);
                }
              }
              // Get likes for each stock.
              let likes1 = 0,
                  likes2 = 0;
              if (savedStock1) {
                likes1 = savedStock1.likes_per_ip.length;
              }
              if (savedStock2) {
                likes2 = savedStock2.likes_per_ip.length;
              }
              // Return stock object with relative Likes.
              stockObject.stockData = [
                  {
                    stock: requestedStock[0].toUpperCase(),
                    price: price1,
                    rel_likes: likes2 - likes1
                  },
                  {
                    stock: requestedStock[1].toUpperCase(),
                    price: price2,
                    rel_likes: likes1 - likes2
                  }
              ];
              res.json(stockObject);
            }
          }
        }
        else {
          res.send('no stock given');
        }
      });

  app.get('/drop', function(req, res) {
    //if successful response will be 'complete delete successful'
    Stock.deleteMany( { } , (err, stock) =>
        err ?
            res.send('complete delete error') :
            res.send('complete delete successful')
    );
  });
    
};
