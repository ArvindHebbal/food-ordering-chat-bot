var mongoose = require('mongoose'),
    rp = require('request-promise'),
    Address = require('../controller/address'),
    Orders = require('../model/orders'),
    OrderCtrl = require('../controller/orders'),
    fbTemplate = require('../../fbTemplate'),
    parser = require('xml2json'),
    staticText = require('../../staticText'),
    constants = require('../../payload'),
    Q = require('q')

var customer_id = 'cus_Lt7vnfHUD_0HXV'
var app_key = '5773E618-B776-11E8-9B16-3A4F8E89CD5A'


/**
 ** @author: Arvind Hebbal
 *
 ** @Date: 12/09/18
 *
 ** @function: getDeliveryQuoteId
 *
 ** @parameter: 
 *
 ** @description: get Delivery Quote Id
 *  
 ** @db_table: 
 *  
 ** @returns {object} Returns 
 *
 **/
exports.getDeliveryQuoteId = async (psid) => {
    var deferred = Q.defer()
    console.log('\nget Delivery Quote Id\n',psid)
var asdf;
var qwerty;
    try{console.log('findAddressByPSID',psid)
        let user_address = await Address.findAddressByPSID(psid)
        qwerty = user_address;
        console.log('get Pickup Address',user_address.address)
        let pickup_data = await getPickUpAddress(user_address.address)
        asdf = pickup_data;
        console.log('final pickup',pickup_data,asdf)
    }catch(e){
        console.log('error-2',e)
    }

    var options = {
        uri: 'https://api.postmates.com/v1/customers/' + customer_id + '/delivery_quotes',
        formData: {
            // pickup_address: '20 McAllister St, San Francisco, CA',
            // pickup_address: '26792 Portola Pkwy, Foothill Ranch, CA, 92610',
            pickup_address: asdf.response.collection.poi.address1 + ', ' + asdf.response.collection.poi.city + ', ' + asdf.response.collection.poi.state + ', ' + asdf.response.collection.poi.postalcode,
            dropoff_address: qwerty.address
        },
        headers: {
            'Authorization': 'Basic MmIyYTZiM2ItOTZlYS00YjE0LTgwZWEtOGVmN2FiMDYwYzI3Og=='
        },
        method: 'POST',
        json: true // Automatically parses the JSON string in the response
    }
// console.log('option',Option)
    rp(options)
    .then(async (result) => {
        console.log('asdsfsdfsdf',result)
        result.dropoff_address = qwerty.address
        deferred.resolve(result)
    })
    .catch((err) => {
        console.log('vxcvxcv',err)
        deferred.reject(err)
    });
    return deferred.promise;
}

/**
 ** @author: Arvind Hebbal
 *
 ** @Date: 12/09/18
 *
 ** @function: createDelivery
 *
 ** @parameter: 
 *
 ** @description: create Delivery
 *  
 ** @db_table: 
 *  
 ** @returns {object} Returns 
 *
 **/
exports.createDelivery = (delivery_quote_data, pickup_data) => {
    var deferred = Q.defer()
    console.log('create Delivery Id')
    var options = {
        uri: 'https://api.postmates.com/v1/customers/' + customer_id + '/deliveries',
        formData: {
            quote_id: delivery_quote_data.id,
            manifest: 'Food items',
            pickup_name: 'Kitten Warehouse',
            // pickup_address: '20 McAllister St, San Francisco, CA',
            // pickup_address: '26792 Portola Pkwy, Foothill Ranch, CA, 92610',
            pickup_address: pickup_data.response.collection.poi.address1 + ', ' + pickup_data.response.collection.poi.city + ', ' + pickup_data.response.collection.poi.state + ', ' + pickup_data.response.collection.poi.postalcode,
            pickup_phone_number: '415-555-4242',
            pickup_notes: 'Ring the doorbell twice',
            dropoff_name: 'Alice',
            dropoff_address: delivery_quote_data.dropoff_address,
            dropoff_phone_number: '415-555-8484',
            dropoff_notes: 'Tell the security guard that you are here to see deliver'
        },
        headers: {
            'Authorization': 'Basic MmIyYTZiM2ItOTZlYS00YjE0LTgwZWEtOGVmN2FiMDYwYzI3Og=='
        },
        method: 'POST',
        json: true // Automatically parses the JSON string in the response
    }

    rp(options)
    .then((result) => {
        console.log('delivery data :', result)
        deferred.resolve(result)
    })
    .catch((err) => {
        deferred.reject(err)
    });
    // var address = new Address(data);
    // address.save(function (err, result) {
    //     if (err) {
    //         console.log(err)
    //         deferred.reject(err)
    //     } else {
    //         deferred.resolve(result);
    //     }
    // })
    return deferred.promise;
}

/**
 ** @author: Arvind Hebbal
 *
 ** @Date: 12/09/18
 *
 ** @function: getDeliveryById
 *
 ** @parameter: 
 *
 ** @description: get Delivery By Id
 *  
 ** @db_table: 
 *  
 ** @returns {object} Returns 
 *
 **/
exports.getDeliveryById = (del_id) => {
    var deferred = Q.defer()
    console.log('\nget Delivery By Id\n')
    var options = {
        uri: 'https://api.postmates.com/v1/customers/' + customer_id + '/deliveries/' + del_id,
        headers: {
            'Authorization': 'Basic MmIyYTZiM2ItOTZlYS00YjE0LTgwZWEtOGVmN2FiMDYwYzI3Og=='
        },
        method: 'GET',
        json: true // Automatically parses the JSON string in the response
    }

    rp(options)
    .then((result) => {
        console.log('delivery data :', result)
        deferred.resolve(result)
    })
    .catch((err) => {
        deferred.reject(err)
    });
    return deferred.promise;
}

/**
 ** @author: Arvind Hebbal
 *
 ** @Date: 12/09/18
 *
 ** @function: getDeliveryIdByPsidAndStatus
 *
 ** @parameter: 
 *
 ** @description: getDeliveryIdByPsidAndStatus
 *  
 ** @db_table: 
 *  
 ** @returns {object} Returns 
 *
 **/

 exports.getDeliveryIdByPsidAndStatus = (psid) => {
    var deferred = Q.defer()
    console.log('get Delivery Id By Psid And Status')
    Orders.findOne({ sender_id: psid, is_delivered: false }, function (err, result) {
        if (err) {
            console.log("gotError", err)
            deferred.reject(err)
        } else {
            console.log("order data : ", result)
            deferred.resolve(result);
        }
    })
    return deferred.promise;
 }

 /**
 ** @author: Arvind Hebbal
 *
 ** @Date: 12/09/18
 *
 ** @function: sendDeliveryStatus
 *
 ** @parameter: 
 *
 ** @description: send Delivery Status
 *  
 ** @db_table: 
 *  
 ** @returns {object} Returns 
 *
 **/

 exports.sendDeliveryStatus = async (req, res) => {
    var deferred = Q.defer()
    console.log('sendDeliveryStatus',req.body)
    var delivery_data = req.body
    if(delivery_data.kind == "event.delivery_status"){
        console.log('\nsend Delivery Status\n', delivery_data.status)

        var order_data = await OrderCtrl.findOrderByDeliveryId(delivery_data.delivery_id)
        
        if(delivery_data.status == "pending"){
          var delivery_status_message = "We've accepted the delivery and will be assigning a delivery guy to pick your order soon."
        }else if(delivery_data.status == "pickup"){
          var delivery_status_message = "A delivery guy has been assigned and is en route to pick up your order."
        }else if(delivery_data.status == "pickup_complete"){
          var delivery_status_message = "Delivery guy has picked up the items."
        }else if(delivery_data.status == "dropoff"){
          var delivery_status_message = "Delivery guy is on the way to your location."
        }else if(delivery_data.status == "canceled"){
          var delivery_status_message = "Deliveries are either canceled by the customer or by our customer service team."
        }else if(delivery_data.status == "delivered"){

          var delivery_status_message = "Your order has been delivered successfully. Enjoy your meal. \nPlease give your feedback by clicking the feedback button on the menu."
          order_data.is_delivered = true
        }

        if(order_data.status != delivery_data.status){
            try{
                order_data.status = delivery_data.status
                order_data = await OrderCtrl.findOrderAndUpdateById(order_data)
                console.log(delivery_status_message)
                if (delivery_data.status == "delivered") {
                    console.log('entered into if',delivery_data.status)
                    var q1 = fbTemplate.createQuickReply(staticText.FEEDBACK, constants.UNDER_CONSTRUCTION5)
                    var q2 = fbTemplate.createQuickReply(staticText.CREATE_NEW_ORDER, constants.CATEGORIES)
                    var qr = [q1, q2]
                    var message = fbTemplate.quickReplyMessage(delivery_status_message, qr)
                }
                else {
                    var message = fbTemplate.textMessage(delivery_status_message)
                }
                return fbTemplate.reply(message, order_data.sender_id)
            }
            catch(err){
                console.log(err)
            }
        }
        
        res.send({"message": "received"})
    }else{
        res.send({"message": "received"})
    }
 }


  /**
     ** @author: Arvind Hebbal
     *
     ** @Date: 12/09/18
     *
     ** @function: sendDeliveryStatus
     *
     ** @parameter: 
     *
     ** @description: send Delivery Status
     *  
     ** @db_table: 
     *  
     ** @returns {object} Returns 
     *
  **/

 var getPickUpAddress = exports.getPickUpAddress = (dropoff_address) => {
    var deferred = Q.defer()
    console.log('\nget Pickup Address\n', dropoff_address)

    // var dropoff_address = 'Rancho Santa Margarita, CA'

    var xml_request = `<request>
                            <appkey>` + app_key + `</appkey>
                            <formdata id="locatorsearch">
                                <dataview>store_default</dataview>
                                <geolocs>
                                    <geoloc>
                                          <addressline>` + dropoff_address + `</addressline>
                                        <longitude></longitude>
                                        <latitude></latitude>
                                    </geoloc>
                                </geolocs>
                                <proximitymethod>straightline</proximitymethod>
                                <searchradius>5</searchradius>
                            </formdata>
                        </request>`

    var options = {
        uri: 'https://api.slippymap.com/rest?&xml_request=' + xml_request,
        method: 'GET'
    }

    rp(options)
    .then((result) => {
        console.log('pick up data :', JSON.parse(parser.toJson(result)))
        // res.json(JSON.parse(parser.toJson(result)))
        deferred.resolve(JSON.parse(parser.toJson(result)))
    })
    .catch((err) => {
        deferred.reject(err)
    });
    return deferred.promise;
 }
