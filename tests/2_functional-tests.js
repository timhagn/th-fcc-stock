/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          console.log(res.body);
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.isObject(res.body.stockData, 'stockData should be an object');
          assert.equal(res.body.stockData.stock, 'GOOG', 'stockData should have GOOG as stock');
          assert.property(res.body.stockData, 'price', 'stockData should have price');
          assert.property(res.body.stockData, 'likes', 'stockData should have likes');
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({stock: 'goog', like: true })
            .end(function(err, res){
              console.log(res.body);
              assert.equal(res.status, 200);
              assert.isObject(res.body, 'response should be an object');
              assert.isObject(res.body.stockData, 'stockData should be an object');
              assert.equal(res.body.stockData.stock, 'GOOG', 'stockData should have GOOG as stock');
              assert.property(res.body.stockData, 'price', 'stockData should have price');
              assert.equal(res.body.stockData.likes, 1, 'stockData should have likes');
              done();
            });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({stock: 'goog', like: true })
            .end(function(err, res){
              console.log(res.body);
              assert.equal(res.status, 200);
              assert.isObject(res.body, 'response should be an object');
              assert.isObject(res.body.stockData, 'stockData should be an object');
              assert.equal(res.body.stockData.stock, 'GOOG', 'stockData should have GOOG as stock');
              assert.property(res.body.stockData, 'price', 'stockData should have price');
              assert.equal(res.body.stockData.likes, 1, 'stockData should have likes');
              done();
            });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({stock: ['goog', 'msft'] })
            .end(function(err, res){
              console.log(res.body);
              assert.equal(res.status, 200);
              assert.isObject(res.body, 'response should be an object');
              assert.isArray(res.body.stockData, 'stockData should be an array');
              assert.equal(res.body.stockData[0].stock, 'GOOG', 'stockData1 should have GOOG as stock');
              assert.property(res.body.stockData[0], 'price', 'stockData1 should have price');
              assert.property(res.body.stockData[0], 'rel_likes', 'stockData1 should have rel_likes');
              assert.equal(res.body.stockData[1].stock, 'MSFT', 'stockData2 should have MSFT as stock');
              assert.property(res.body.stockData[1], 'price', 'stockData2 should have price');
              assert.property(res.body.stockData[1], 'rel_likes', 'stockData2 should have rel_likes');
              done();
            });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({stock: ['goog', 'msft'], like: true })
            .end(function(err, res){
              assert.equal(res.status, 200);
              assert.isObject(res.body, 'response should be an object');
              assert.isArray(res.body.stockData, 'stockData should be an array');
              assert.equal(res.body.stockData[0].stock, 'GOOG', 'stockData1 should have GOOG as stock');
              assert.property(res.body.stockData[0], 'price', 'stockData1 should have price');
              assert.property(res.body.stockData[0], 'rel_likes', 'stockData1 should have rel_likes');
              assert.equal(res.body.stockData[0].rel_likes, 0, 'stockData should have likes');
              assert.equal(res.body.stockData[1].stock, 'MSFT', 'stockData2 should have MSFT as stock');
              assert.property(res.body.stockData[1], 'price', 'stockData2 should have price');
              assert.property(res.body.stockData[1], 'rel_likes', 'stockData2 should have rel_likes');
              assert.equal(res.body.stockData[1].rel_likes, 0, 'stockData should have likes');
              done();
            });
      });
      
    });

});
