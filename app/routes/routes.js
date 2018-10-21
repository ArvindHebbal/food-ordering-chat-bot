'use strict';

var foo = require('../implementation'),
    implement = foo(),
    Categories = require('./../db/controller/categories'),
    Outlets = require('./../db/controller/outlets'),
    Food = require('./../db/controller/food'),
    Ingredient = require('./../db/controller/ingredients'),
    Delivery = require('./../db/controller/delivery')

module.exports = function (app) {
    /*
      ** @type: `get`
      ** @request_body: 'null'
      ** @reuest_params: 'null'
      ** @description: API to fetch all the service requests
      ** @dashboard: service request page
      *
    */
    app.route('/sendSuccessfullmessage')
        .post(function (req, res) {
            implement.sendSuccessfullMessage(req.body)
                .then(function (result) {
                    res.send({ "status": 1 })
                })
        })
    app.route('/createCategory')
        .post(function (req, res) {
            Categories.createCategory(req.body)
                .then(function (result) {
                    console.log('result of createCategory', result)
                    res.send(result)
                })
        })
    app.route('/createOutlet')
        .post(function (req, res) {
            Outlets.createOutlet(req.body)
                .then(function (result) {
                    console.log('result of createOutlet', result)
                    res.send(result)
                })
        })
    app.route('/createFood')
        .post(function (req, res) {
            Food.createFood(req.body)
                .then(function (result) {
                    console.log('result of createFood', result)
                    res.send(result)
                })
        })

    app.route('/delivery_status')
        .post(Delivery.sendDeliveryStatus)

    // app.route('/pickup')
    //     .get(Delivery.getPickUpAddress) 

    // app.route('/test/:psid')
    //     .get(Delivery.getDeliveryQuoteId)
    
    app.route('/createIngredient')
        .post(function (req, res) {
            Ingredient.createIngredient(req.body)
                .then(function (result) {
                    console.log('result of createIngredient', result)
                    res.send(result)
                })
        })
    app.route('/customizedFood/:foodId')
        .get(function (req, res) {
            Food.customizedFoodOnId(req.params.foodId)
                .then(function (result) {
                    console.log('result of customizedFoodOnId', result)
                    res.send(result)
                })
        })
    app.route('/addFoodTo/:senderId')
        .post(function (req, res) {
            implement.addFoodToCart(req.params.senderId, req.body)
                .then(function (result) {
                    console.log('result of addFoodToCart', result)
                    res.send(result)
                })
        })
}