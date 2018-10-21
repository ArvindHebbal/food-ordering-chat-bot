var mongoose = require('mongoose'),
    Users = require('../model/users'),
    Q = require('q')

exports.createUser = function (data) {
    var deferred = Q.defer()
    console.log('createUser function',data)
    console.log(data)
    var user = new Users(data);
    user.save(function (err, result) {
        if (err) {
            console.log('error in creating user',err)
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
 ** @function: findUserBysenderID
 ** @parameter: senderID
 ** @description: find user by senderID
 ** @db_table: Users
 ** @returns {object} Returns users
 **/
exports.findUserBysenderID = function (senderID) {
    console.log("psid", senderID)
    var deferred = Q.defer()
    Users.findOne({ sender_id: senderID }, function (err, result) {
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
 ** @description: find bot user by psid and set the corresponding is_subscribed to false
 ** @db_table: botUsers
 ** @returns {object} Returns bot users
 **/
exports.updateUserBysenderID = async function (user_data) {
    var deferred = Q.defer()
    console.log('working', user_data)
    Users.findOneAndUpdate({ "sender_id": user_data.sender_id }, user_data, { new: true }, function (err, result) {
        if (err) {
            console.log('error here', err);
        } else {
            console.log('result', result)
            deferred.resolve()
        }
    })
}