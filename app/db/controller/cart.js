var mongoose = require('mongoose'),
    Carts = require('../model/cart'),
    Q = require('q')

exports.createCart = function (data) {
    var deferred = Q.defer()
    console.log('createCart function', data)
    console.log(data)
    var cart = new Carts(data);
    cart.save(function (err, result) {
        if (err) {
            console.log(err)
            deferred.reject(err)
        } else {
            deferred.resolve(result);
        }
    })
    return deferred.promise;
}

/**
 ** @author: Arvind Hebal
 ** @Date: 10/09/18
 ** @function: findCartBysenderID
 ** @parameter: senderID
 ** @description: find cart by senderID
 ** @db_table: Carts
 ** @returns {object} Returns Cart
 **/
exports.findCartBysenderID = function (senderID) {
    // console.log("psid", psid)
    var deferred = Q.defer()
    Carts.findOne({ sender_id: senderID }, function (err, result) {
        if (err) {
            console.log("gotError", err)
            deferred.reject(err)
        } else {
            // console.log("gotResult", result)
            deferred.resolve(result);
        }
    })
    return deferred.promise;
}

exports.findPopulatedCartBysenderID = function (senderID) {
    // console.log("psid", psid)
    var deferred = Q.defer()
    Carts.find({ sender_id: senderID }, {})
        .populate({
            path: 'menu_items.menu_item',
            model: 'Food'
        })
        .populate({
            path: 'menu_items.ingredients',
            model: 'Ingredient'
        })
        .exec((err, result) => {

            if (err) {
                console.log("gotError", err)
                deferred.reject(err)
            } else {
                console.log("gotResult", result)
                deferred.resolve(result);
            }
        })
    return deferred.promise;
}

/**
 ** @author: Arvind Hebal
 ** @Date: 10/09/18
 ** @function: unsubscribeUserByPsid
 ** @parameter: botUser body
 ** @description: find user cart by senderid
 ** @db_table: Carts
 ** @returns {object} Returns users cart
 **/
exports.updateCartBysenderID = function (cart_data) {
    var deferred = Q.defer()
    console.log('working', cart_data)
    Carts.findOneAndUpdate({ "sender_id": cart_data.sender_id }, cart_data, { new: true }, function (err, result) {
        if (err) {
            console.log('error here', err);
        } else {
            console.log('result', result)
            deferred.resolve()
        }
    })
}