var mongoose = require('mongoose'),
    Category = require('../model/categories'),
    Q = require('q')

exports.createCategory = function (data) {
    var deferred = Q.defer()
    console.log('createCategory function', data)
    console.log(data)
    var category = new Category(data);
    category.save(function (err, result) {
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
 ** @function: findAllCategories
 ** @description: find all categories
 ** @db_table: categories
 ** @returns {object} Returns categories
 **/
exports.findAllCategories = function () {
    // console.log("psid", psid)
    var deferred = Q.defer()
    Category.find({}, function (err, result) {
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
 ** @function: findCategoryByPayload
 ** @description: find category by payload
 ** @db_table: category
 ** @returns {object} Returns category
 **/
exports.findCategoryByPayload = function (Payload) {
    // console.log("psid", psid)
    var deferred = Q.defer()
    Category.findOne({ payload: Payload }, function (err, result) {
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