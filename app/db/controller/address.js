var mongoose = require('mongoose'),
    Address = require('../model/address'),
    Q = require('q')

exports.createUserAddress = function (data) {
    var deferred = Q.defer()
    console.log('createUser function',data)
    console.log(data)
    var address = new Address(data);
    address.save(function (err, result) {
        if (err) {
            console.log(err)
            deferred.reject(err)
        } else {
            deferred.resolve(result);
        }
    })
    return deferred.promise;
}

exports.findAddressByPSID = (psid) => {
    var deferred = Q.defer()
    console.log('find Address By PSID')
    Address.findOne({ sender_id: psid }, function (err, result) {
        if (err) {
            console.log("gotError", err)
            deferred.reject(err)
        } else {
            console.log("result:asd ", result)
            deferred.resolve(result);
        }
    })
    return deferred.promise;
}

exports.updateAddressBysenderID = function (address_data) {
    var deferred = Q.defer()
    console.log('working', address_data)
    Address.findOneAndUpdate({ "sender_id": address_data.sender_id }, address_data, { new: true }, function (err, result) {
        if (err) {
            console.log('error here', err);
        } else {
            console.log('result', result)
            deferred.resolve()
        }
    })
}