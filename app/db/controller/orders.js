var mongoose = require('mongoose'),
    Orders = require('../model/orders'),
    Q = require('q')

exports.createOrder = function (data) {
    var deferred = Q.defer()
    console.log('createOrder function', data)
    console.log(data)
    var order = new Orders(data);
    order.save(function (err, result) {
        if (err) {
            console.log('create order error', err)
            deferred.reject(err)
        } else {
            deferred.resolve(result);
        }
    })
    return deferred.promise;
}

exports.findPopulatedOrderByID = function (orderID) {
    // console.log("psid", psid)
    var deferred = Q.defer()
    Orders.findOne({ _id: orderID }, {})
        .populate({
            path: 'menu_items.menu_item',
            model: 'Food'
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


exports.findOrderByDeliveryId = function (del_id) {
    var deferred = Q.defer()
    console.log('find Order By DeliveryId')
    Orders.findOne({ delivery_id: del_id }, function (err, result) {
        if (err) {
            console.log('error',err)
            deferred.reject(err)
        } else {
            deferred.resolve(result);
        }
    })
    return deferred.promise;
}

exports.findOrderAndUpdateById = function (order_data) {
    var deferred = Q.defer()
    console.log('\nfind Order And Update By Id\n')
    Orders.findOneAndUpdate({ _id: order_data._id }, order_data, { new: true }, function (err, result) {
        if (err) {
            console.log('error',err)
            deferred.reject(err)
        } else {
            deferred.resolve(result);
        }
    })
    return deferred.promise;
}