var mongoose = require('mongoose'),
    Ingredients = require('../model/ingredients'),
    Q = require('q')

exports.createIngredient = function (data) {
    var deferred = Q.defer()
    console.log('createIngredient function', data)
    console.log(data)
    var ingredient = new Ingredients(data);
    ingredient.save(function (err, result) {
        if (err) {
            console.log(err)
            deferred.reject(err)
        } else {
            deferred.resolve(result);
        }
    })
    return deferred.promise;
}