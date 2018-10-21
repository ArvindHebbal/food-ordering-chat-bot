var mongoose = require('mongoose'),
    Outlets = require('../model/outlets'),
    Q = require('q')

exports.createOutlet = function (data) {
    var deferred = Q.defer()
    console.log('createOutlet function', data)
    console.log(data)
    var outlets = new Outlets(data);
    outlets.save(function (err, result) {
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
 ** @function: findAllOutlets
 ** @description: find all outlets
 ** @db_table: outlets
 ** @returns {object} Returns outlets
 **/
exports.findAllOutlets = function () {
    // console.log("psid", psid)
    var deferred = Q.defer()
    Outlets.find({}, function (err, result) {
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