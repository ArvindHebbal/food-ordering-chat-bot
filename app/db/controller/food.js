var mongoose = require('mongoose'),
    Food = require('../model/food'),
    Q = require('q')

exports.createFood = function (data) {
    var deferred = Q.defer()
    console.log('createFood function', data)
    console.log(data)
    var food = new Food(data);
    food.save(function (err, result) {
        if (err) {
            console.log(err)
            deferred.reject(err)
        } else {
            deferred.resolve(result);
        }
    })
    return deferred.promise;
}

exports.getFoodOnCategory = function (Category) {
    var deferred = Q.defer()
    console.log('getFoodOnCategory', Category)
    Food.find({ category: Category }, function (err, result) {
        if (err) {
            console.log("gotError", err)
            deferred.reject(err)
        } else {
            console.log("gotResult1", result)
            deferred.resolve(result);
        }
    })
    return deferred.promise;
}


exports.getFoodById = function (FoodId) {
    var deferred = Q.defer()
    console.log('getFoodById', FoodId)
    Food.find({ _id: FoodId }, function (err, result) {
        if (err) {
            console.log("gotError", err)
            deferred.reject(err)
        } else {
            console.log("gotResult1", result)
            deferred.resolve(result);
        }
    })
    return deferred.promise;
}

exports.customizedFoodOnId = function (foodId) {
    var deferred = Q.defer()
    console.log('customizedFoodOnId', foodId)
    Food.find({ _id: foodId }, {})
        .populate({
            path: 'category',
            model: 'Category',
            populate: {
                path: 'ingredients',
                model: 'Ingredient'
            }
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