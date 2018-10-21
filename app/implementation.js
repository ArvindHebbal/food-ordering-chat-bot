// 'use strict';

var fbTemplate = require('./fbTemplate'),
    constants = require("./payload"),
    externalApi = require('./api'),
    Q = require("q"),
    _ = require("underscore"),
    moment = require('moment'),
    messenger = require("./messenger"),
    Adapter = require("./Adapter"),
    staticText = require("./staticText"),
    fs = require('fs'),
    dialogflow = require("dialogflow"),
    Outlets = require("./db/controller/outlets"),
    Categories = require("./db/controller/categories"),
    Food = require("./db/controller/food"),
    Carts = require("./db/controller/cart"),
    Delivery = require("./db/controller/delivery"),
    Orders = require("./db/controller/orders"),
    Users = require('./db/controller/users'),
    stripeUrl = 'https://bot-stripe-payment.herokuapp.com/',
    db = new Adapter();

module.exports = function () {

    var getStarted = function (senderID) {
        console.log('getStarted', senderID)
        var userProfile;
        return externalApi.getUserProfile(senderID)
            .then(function (data) {
                userProfile = data
                // console.log('userProfile', userProfile)
                // return db.getBotUser(senderID)
                return userProfile
            })
            .then(function (user) {
                // console.log('user', user)
                if (user.length != 0) {
                    console.log('user exists')
                } else {
                    // return db.insertBotUser(userProfile, senderID)
                    return user
                }
            })
            .then(function () {
                // console.log('userProfile', userProfile, senderID)
                return greetUser(userProfile.first_name, senderID)
            })
    }
    var greetUser = function (first_name, senderID) {
        // var qr1 = fbTemplate.createLocationQuickReply(staticText.SHARE, constants.SHARE)
        var qr1 = fbTemplate.createQuickReplyWithImage(staticText.PLACE_ORDER, constants.PLACE_ORDER, staticText.PLACE_ORDER_URL)
        var qr2 = fbTemplate.createQuickReplyWithImage(staticText.LOCATION_INFORMATION, constants.LOCATION_ADDRESS, staticText.LOCATION_INFORMATION_URL)
        var qr3 = fbTemplate.createQuickReplyWithImage(staticText.DEALS, constants.UNDER_CONSTRUCTION2, staticText.DEALS_URL)
        var qr = [qr1, qr2, qr3]
        var message = fbTemplate.quickReplyMessage(staticText.GREET1 + first_name + ', ' + staticText.GREET2 + '\n' + staticText.CHOOSE_OPTION, qr)

        return fbTemplate.reply(message, senderID)
    }
    var storeInitialAddress = function (senderID) {
        var message = fbTemplate.textMessage(staticText.ENTER_ADDRESS)

        return fbTemplate.reply(message, senderID)
            .then(function () {
                console.log('\nCreate initial address context')
                return messenger.setFreeTextContext('ShareInitialAddress', senderID)
            })
    }
    var storePhoneNumber = function (senderID) {
        var message = fbTemplate.textMessage(staticText.ENTER_PHONE_NUMBER)

        return fbTemplate.reply(message, senderID)
            .then(function () {
                console.log('\nCreate initial address context')
                return messenger.setFreeTextContext('StorePhoneNumber', senderID)
            })
    }
    var fetchPhoneNumber = function (senderID) {
        var message = fbTemplate.textMessage(staticText.ENTER_PHONE_NUMBER)

        var qr1 = fbTemplate.createPhoneNumberQuickReply(staticText.SHARE, constants.SHARE)
        var qr = [qr1]
        var message = fbTemplate.quickReplyMessage(staticText.ENTER_PHONE_NUMBER, qr)

        return fbTemplate.reply(message, senderID)
    }
    var displayNearByOutletsBeginning = function (senderID) {
        var message = fbTemplate.textMessage(staticText.NEARBY_OUTLETS1);
        return fbTemplate.reply(message, senderID)
            .then(function () {
                displayNearByOutlets(senderID)
            })
    }
    var displayNearByOutlets = function (senderID) {
        console.log('displayNearByOutlets', senderID)
        // var data = fs.readFileSync('app/data/nearby_outlets.json', 'utf8');
        var nearby_outlets = JSON.parse(data);
        var elements = [];
        var buttons = [];
        nearby_outlets.forEach((place, i) => {
            console.log("Execution: ", i)
            buttons[0] = fbTemplate.createPostBackButton(staticText.CHECK_OUT, constants.NEARBY_OUTLETS)
            elements[i] = fbTemplate.createElement(place.title, place.subtitle, place.item_url, place.image_url, buttons)
            console.log("Element: ", elements[i])
            buttons = [];
        })
        var message = fbTemplate.genericMessage(elements)
        // console.log('message', message)
        return fbTemplate.reply(message, senderID)
    }
    var orderType = function (senderID) {
        var qr1 = fbTemplate.createQuickReply(staticText.MAKE_RESERVATION, constants.UNDER_CONSTRUCTION)
        var qr2 = fbTemplate.createQuickReply(staticText.DELIVERY, constants.DELIVERY)
        var qr3 = fbTemplate.createQuickReply(staticText.ONLINE, constants.UNDER_CONSTRUCTION)
        var qr = [qr2, qr3, qr1]
        var message = fbTemplate.quickReplyMessage(staticText.TYPE_OF_ORDER, qr)

        return fbTemplate.reply(message, senderID)
    }

    var showNearByStoresBeginning = function (senderID) {
        var message = fbTemplate.textMessage(staticText.NEARBY_OUTLETS2);
        return fbTemplate.reply(message, senderID)
            .then(function () {
                showStores(senderID)
            })
    }
    var showStores = async function (senderID) {
        // var data = fs.readFileSync('app/data/stores.json', 'utf8');
        // var stores = JSON.parse(data);
        var stores = await Outlets.findAllOutlets()
        var elements = [];
        var buttons = [];
        stores.forEach((place, i) => {
            buttons[0] = fbTemplate.createPostBackButton(staticText.SELECT, constants.CATEGORIES)
            elements[i] = fbTemplate.createElement(place.title, place.subtitle, place.item_url, place.image_url, buttons)
            console.log("Element: ", elements[i])
            buttons = [];
        })
        // var q1 = fbTemplate.createQuickReply(staticText.DELIVERY, constants.DELIVERY)
        // var q2 = fbTemplate.createQuickReply(staticText.ONLINE, constants.ONLINE)
        // var qr = [q1, q2]
        var message = fbTemplate.genericMessage(elements)
        // message.quick_replies = qr;
        // console.log('message', message, qr)
        return fbTemplate.reply(message, senderID)
    }
    var storeDeliveryAddress = function (senderID) {
        console.log('store Deliver address')
        var message = fbTemplate.textMessage(staticText.DELIVERY_ADDRESS)

        return fbTemplate.reply(message, senderID)
            .then(function () {
                console.log('\nCreate delivery address context')
                return messenger.setFreeTextContext('StoreDeliveryAddress', senderID)
            })
    }
    var displayCategories = async function (senderID) {
        var categories = await Categories.findAllCategories();
        console.log('Categories', categories)
        var qr = [];
        categories.forEach((category, i) => {
            var q = fbTemplate.createQuickReply(category.name, 'CATEGORY-' + category._id);
            qr.push(q);
        })
        var message = fbTemplate.quickReplyMessage(staticText.SELECT_CATEGORY, qr)

        return fbTemplate.reply(message, senderID)
    }

    var displayFoodOnCategory = async function (senderID, selectedCategoryId) {
        // var selectedCategory = await Categories.findCategoryByPayload(payload)
        console.log('selectedCategory', selectedCategoryId)
        var food = await Food.getFoodOnCategory(selectedCategoryId)
        console.log('dishes', food)
        var elements = [];
        var buttons = [];
        console.log('allfood', food)
        food.forEach((place, i) => {
            console.log("Execution: ", i)
            // buttons[0] = fbTemplate.createPostBackButton(staticText.ADD_TO_CART, 'ADD_TO_CART-' + place._id)
            buttons[0] = fbTemplate.createWebViewButton(stripeUrl + senderID + '/menu_item/' + place._id, staticText.ADD_TO_CART, 'TALL')
            // buttons[0] = fbTemplate.createWebUrlButton(staticText.ADD_TO_CART, 'localhost:4200/' + senderID + '/menu_item/' + place._id)
            buttons[1] = fbTemplate.createPostBackButton(staticText.VIEW_DESCRIPTION, constants.VIEW_DESCRIPTION + '-' + place._id)
            elements.push(fbTemplate.createElement(place.title + ' - $' + place.price, place.subtitle, place.item_url, place.image_url, buttons))
            console.log("Element: ", elements[i])
            buttons = [];
        })
        var q1 = fbTemplate.createQuickReply(staticText.ADD_MORE_OPTIONS, constants.CATEGORIES)
        var q2 = fbTemplate.createQuickReply(staticText.VIEW_CART, constants.DISPLAY_CART)
        var qr = [q1, q2]
        var message = fbTemplate.genericMessageWithQuickReply(elements, qr)
        // console.log('message', message)
        return fbTemplate.reply(message, senderID)
    }

    var enterQuantity = async function (payload, senderID) {
        var message = fbTemplate.textMessage(staticText.ENTER_QUANTITY)

        return fbTemplate.reply(message, senderID)
            .then(function () {
                console.log('\nCreate enter quantity context')
                return messenger.setFreeTextContext(payload, senderID)
            })
    }
    // Ask if the user want to add more items. If yes show Categories of food or show cart
    var askMore = async function (senderID, number, dishOrdered) {
        var recentDish = await Food.getFoodById(dishOrdered.menu_item)
        recentDish = recentDish[0]
        var buttons = [];
        buttons[0] = fbTemplate.createPostBackButton(staticText.YES_CONFIRM, constants.CATEGORIES)
        buttons[1] = fbTemplate.createPostBackButton(staticText.NO_CONFIRM, constants.DISPLAY_CART)
        var message = fbTemplate.buttonMessage('Great i have added ' + number + ' units of ' + recentDish.title + ' to your cart.\nWould you like to add another item ?', buttons)
        // console.log('finalmessage', message)
        return fbTemplate.reply(message, senderID)
    }

    //Send the successfull message from pay stripe after payment
    var sendSuccessfullMessage = async function (postData) {
        var deferred = Q.defer();
        // var message = fbTemplate.textMessage(postData.message)

        // await fbTemplate.reply(message, postData.senderID)

        try {
            console.log('check0', postData.senderID)
            let delivery_quote_data = await Delivery.getDeliveryQuoteId(postData.senderID)
            console.log('check1', delivery_quote_data.dropoff_address);
            let pickup_data = await Delivery.getPickUpAddress(delivery_quote_data.dropoff_address)
            console.log('check2', delivery_quote_data, pickup_data)
            var delivery_data = await Delivery.createDelivery(delivery_quote_data, pickup_data)
            console.log('check3')
        } catch (err) {
            console.log('error', err)
        }
        console.log('check4', postData.senderID)
        var user_cart = await Carts.findCartBysenderID(postData.senderID)

        console.log('order1', order)
        var order = {
            sender_id: user_cart.sender_id,
            menu_items: user_cart.menu_items,
            delivery_id: delivery_data.id
        };

        console.log('order', order)
        var order = await Orders.createOrder(order)
        await afterPaymentMessages(postData, order)
        user_cart.menu_items = [];
        await Carts.updateCartBysenderID(user_cart);
        deferred.resolve({ "status": 1 });
        return deferred.promise;
    }

    var afterPaymentMessages = async function (postData, orderCreated) {
        // console.log('afterPaymentMessages', postData, orderCreated);
        var populatedOrder = await Orders.findPopulatedOrderByID(orderCreated._id)
        var user_data = await Users.findUserBysenderID(postData.senderID);
        // console.log('populatedOrder', populatedOrder)
        var elements = [];
        var rate = 0;
        populatedOrder.menu_items.forEach((element, i) => {
            if (!isNaN(element.menu_item.price)) {
                rate = rate + element.quantity * element.menu_item.price
            } else
                rate = rate + 0;
            elements[i] = fbTemplate.createReceiptElement(element.menu_item.title, element.menu_item.subtitle, element.quantity, element.menu_item.price, 'USD', element.menu_item.image_url)
        })
        var orderNumber = populatedOrder['_id'].toString().slice(-6)


        // console.log('Final elements', populatedOrder['_id'], orderNumber)

        rate = parseFloat(rate.toFixed(2));
        var receiptMessage = fbTemplate.createReceipt(user_data.first_name, orderNumber, rate, elements)


        await fbTemplate.reply(receiptMessage, postData.senderID)
        var buttons = [];

        var confirmation_message = staticText.ORDER_CONFIRMATION(orderNumber);
        // buttons[0] = fbTemplate.createPostBackButton(staticText.VIEW_ORDER, constants.VIEW_ORDER)
        buttons[0] = fbTemplate.createPostBackButton(staticText.TRACK_ORDER_STATUS, constants.TRACK_ORDER_STATUS)
        buttons[1] = fbTemplate.createPostBackButton(staticText.START_NEW_ORDER, constants.CATEGORIES)
        var message = fbTemplate.buttonMessage(confirmation_message, buttons)
        return fbTemplate.reply(message, postData.senderID)
    }
    var editCartMessage = async function (senderID) {
        var user_cart = await Carts.findCartBysenderID(senderID)
        if (!user_cart) {

            var message = fbTemplate.textMessage(staticText.EMPTY_CART);
            return fbTemplate.reply(message, senderID)
                .then(function () {
                    displayCategories(senderID)
                })
        }
        if (user_cart.menu_items) {
            if (user_cart.menu_items.length) {
                var message = fbTemplate.textMessage(staticText.EDIT_CART_MESSAGE);
                return fbTemplate.reply(message, senderID)
                    .then(function () {
                        displayCart(senderID)
                    })
            } else {
                var message = fbTemplate.textMessage(staticText.EMPTY_CART);
                return fbTemplate.reply(message, senderID)
                    .then(function () {
                        displayCategories(senderID)
                    })
            }
        } else {
            var message = fbTemplate.textMessage(staticText.EMPTY_CART);
            return fbTemplate.reply(message, senderID)
                .then(function () {
                    displayCategories(senderID)
                })
        }
    }
    //Display items added to cart for the user
    var displayCart = async function (senderID) {
        var populatedCart = await Carts.findPopulatedCartBysenderID(senderID)

        console.log('displayCart')
        var elements = [];
        var buttons = [];
        // console.log('allfood', JSON.stringify(populatedCart))
        populatedCart[0].menu_items.forEach((dish, i) => {
            console.log("Execution-dish: ", i, dish)
            buttons[0] = fbTemplate.createPostBackButton(staticText.EDIT_CART, constants.UNDER_CONSTRUCTION3)
            buttons[1] = fbTemplate.createPostBackButton(staticText.REMOVE_FROM_CART, constants.REMOVE_FROM_CART + '-' + dish._id)
            buttons[2] = fbTemplate.createPostBackButton(staticText.VIEW_SPECIFICATION, constants.VIEW_SPECIFICATION + '-' + populatedCart[0]._id + '-' + dish._id)
            var ingredient_description = createCartItemDescriptionMessage(dish, dish.ingredients)
            elements.push(fbTemplate.createElement(dish.menu_item.title + ' - Qty ' + dish.quantity, ingredient_description, dish.menu_item.item_url, dish.menu_item.image_url, buttons))
            // console.log("Element: ", elements[i])
            buttons = [];
        })
        var q1 = fbTemplate.createQuickReply(staticText.ADD_MORE_OPTIONS, constants.CATEGORIES)
        var q2 = fbTemplate.createQuickReply(staticText.CHECKOUT, constants.CHECK_OUT)
        var qr = [q1, q2]
        var message = fbTemplate.genericMessageWithQuickReply(elements, qr)
        // console.log('message', message)
        return fbTemplate.reply(message, senderID)
    }
    var viewCartItemSpecification = async function (senderId, cartId, itemId) {
        console.log('viewCartItemSpecification', cartId, itemId)
        var populatedCart = await Carts.findPopulatedCartBysenderID(senderId);
        populatedCart = populatedCart[0];
        var dish = populatedCart.menu_items.find(item => { return (item._id == itemId) })
        // console.log(JSON.stringify(populatedCart.menu_items))
        console.log('dish', dish)
        var ingredient_description = createCartItemDescriptionMessage(dish, dish.ingredients);
        var q1 = fbTemplate.createQuickReply(staticText.ADD_MORE_OPTIONS, constants.CATEGORIES)
        var q2 = fbTemplate.createQuickReply(staticText.CHECKOUT, constants.CHECK_OUT)
        var qr = [q1, q2]
        var message = fbTemplate.quickReplyMessage(ingredient_description, qr)
        return fbTemplate.reply(message, senderId)
    }
    var createCartItemDescriptionMessage = function (dish, ingredients_used) {
        console.log('createCartItemDescriptionMessage',dish)
        var temperatures = [];
        var toppings = [];
        var extras = [];
        ingredients_used.forEach((ingredient, i) => {
            if (ingredient.type == 'TEMPERATURE')
                temperatures.push(ingredient.name)
            else if (ingredient.type == 'TOPPINGS') {
                toppings.push(ingredient.name)
            }
            else if (ingredient.type == 'EXTRAS') {
                extras.push(ingredient.name)
            }
        })
        var temp_message = temperatures.toString() + ' cooked ';
        var message = temp_message;
        ingredients_used = ingredients_used.shift();
        if (toppings.length) {
            var topping_message = 'with toppings - ' + toppings.toString() + ' ';
            message = message + topping_message;
        } if (extras.length) {
            var extra_message = 'with extras - ' + extras.toString();
            message = message + extra_message;
        }
        if (dish.comment) {
            if (dish.comment.length) {
                var comment_message = '\nInstructions: ' + dish.comment;
                message = message + comment_message;
            }
        }
        if(dish.quantity) {
            var quantity_message = '\nQuantity: ' + dish.quantity
            message = message + quantity_message
        }
        return message;
    }
    var underConstruction = function (senderID) {
        var message = fbTemplate.textMessage(staticText.UNDER_CONSTRUCTION)
        return fbTemplate.reply(message, senderID)
            .then(function () {
                console.log('\nUnder construction')
                return orderType(senderID)
            })
    }
    var underConstruction2 = function (senderID) {
        var message = fbTemplate.textMessage(staticText.UNDER_CONSTRUCTION)
        return fbTemplate.reply(message, senderID)
    }
    var underConstruction3 = function (senderID) {
        var q1 = fbTemplate.createQuickReply(staticText.ADD_MORE_OPTIONS, constants.CATEGORIES)
        var q2 = fbTemplate.createQuickReply(staticText.VIEW_CART, constants.DISPLAY_CART)
        var qr = [q1, q2]
        var message = fbTemplate.quickReplyMessage(staticText.UNDER_CONSTRUCTION, qr)
        return fbTemplate.reply(message, senderID)
    }
    var underConstruction4 = function (senderID) {
        var qr1 = fbTemplate.createQuickReply(staticText.POSTMATES, constants.CATEGORIES)
        var qr2 = fbTemplate.createQuickReply(staticText.UBEREATS, constants.UNDER_CONSTRUCTION4)
        var qr3 = fbTemplate.createQuickReply(staticText.GRUBHUB, constants.UNDER_CONSTRUCTION4)
        var qr = [qr1, qr2, qr3]
        var message = fbTemplate.quickReplyMessage(staticText.UNDER_CONSTRUCTION, qr)
        return fbTemplate.reply(message, senderID)
    }
    var underConstruction5 = function (senderID) {
        var q1 = fbTemplate.createQuickReply(staticText.START_NEW_ORDER, constants.CATEGORIES)
        var qr = [q1]
        var message = fbTemplate.quickReplyMessage(staticText.UNDER_CONSTRUCTION, qr)
        return fbTemplate.reply(message, senderID)
    }
    var removeFromTemplate = async function (senderID, removalId) {
        var user_cart = await Carts.findCartBysenderID(senderID)
        // user_cart.menu_items.splice(user_cart.menu_items.findIndex(item => item.menu_item === removalId), 1)
        for (var i = 0; i < user_cart.menu_items.length; i++) {
            if (user_cart.menu_items[i]._id == removalId) {
                user_cart.menu_items.splice(i, 1)
            }
        }
        await Carts.updateCartBysenderID(user_cart);
        // var message = fbTemplate.textMessage(staticText.WHAT_MORE)
        // await fbTemplate.reply(message, senderID)
        // return displayCategories(senderID)
        return editCartMessage(senderID)
    }
    //Calculate and find the amount to pay. Display payment button
    var checkout = async function (senderID) {
        console.log('\ncheckingout\n', senderID)
        var populatedCart = await Carts.findPopulatedCartBysenderID(senderID)
        // console.log('populatedCart', JSON.stringify(populatedCart))
        var rate = 0;
        var ingredients_rate = 0
        populatedCart[0].menu_items.forEach(element => {
            console.log('\n\n', element)
            if (!isNaN(element.menu_item.price)) {
                rate = rate + element.quantity * element.menu_item.price
                // console.log('rate', rate, element.quantity, element.menu_item.price)

                if (element.ingredients.length) {
                    for (let i of element.ingredients) {
                        if (i.price) {
                            ingredients_rate += i.price
                        }
                    }
                    rate += ingredients_rate
                }
            }
            else {
                rate = rate + 0;
            }
        })
        rate = parseFloat(rate.toFixed(2));

        var buttons = [];
        var message1 = fbTemplate.textMessage(staticText.PAYMENT_AMOUNT_MESSAGE(rate))
        await fbTemplate.reply(message1, senderID);
        console.log('total price: ', rate)
        buttons[0] = fbTemplate.createWebViewButton(stripeUrl + senderID + '/payment/' + rate, staticText.PAY_NOW0 + ' $' + rate, 'TALL')
        // buttons[0] = fbTemplate.createWebUrlButton(staticText.PAY_NOW, stripeUrl + senderID + '/payment/' + rate)
        var q1 = fbTemplate.createQuickReply(staticText.ADD_MORE_OPTIONS, constants.CATEGORIES)
        var q2 = fbTemplate.createQuickReply(staticText.VIEW_CART, constants.DISPLAY_CART)
        var qr = [q1, q2]
        var message = fbTemplate.buttonMessage(staticText.PAYMENT_MESSAGE, buttons, qr)
        console.log('finalmessage', message)
        return fbTemplate.reply(message, senderID)
    }

    var getLongLat = function (senderID) {
        var qr1 = fbTemplate.createLocationQuickReply(staticText.SHARE, constants.SHARE)
        var qr = [qr1]
        var message = fbTemplate.quickReplyMessage(staticText.ASK_LONG_LAT, qr)

        return fbTemplate.reply(message, senderID)
    }
    var servicescurrentlyavailable = function (senderID) {
        var qr1 = fbTemplate.createQuickReply(staticText.POSTMATES, constants.CATEGORIES)
        var qr2 = fbTemplate.createQuickReply(staticText.UBEREATS, constants.UNDER_CONSTRUCTION4)
        var qr3 = fbTemplate.createQuickReply(staticText.GRUBHUB, constants.UNDER_CONSTRUCTION4)
        var qr = [qr1, qr2, qr3]
        var message = fbTemplate.quickReplyMessage(staticText.SERVICE_AVAILABLE_MESSAGE, qr)
        return fbTemplate.reply(message, senderID)
    }

    var addFoodToCart = async function (senderID, postData) {
        var deferred = Q.defer();
        // window.close();
        console.log('addFoodToCart', senderID, postData)
        var Cart = await Carts.findCartBysenderID(senderID)
        if (!Cart) {
            Cart = await Carts.createCart({ sender_id: senderID, menu_items: [] })
        }
        var dishOrdered = Cart.menu_items.find(item => { return (item.menu_item == postData.menu_item) })
        console.log('dishOrdered', dishOrdered, !dishOrdered)

        if (!dishOrdered) {
            dishOrdered = {
                'menu_item': postData.menu_item,
                'ingredients': postData.ingredients,
                'quantity': postData.quantity,
                'comment': postData.comment
            };
            console.log('first if')
            Cart.menu_items.push(dishOrdered)
        } else {
            dishOrdered = {
                'menu_item': postData.menu_item,
                'ingredients': postData.ingredients,
                'quantity': postData.quantity,
                'comment': postData.comment
            };
            console.log('second if')
            var oldIngredients = Cart.menu_items[Cart.menu_items.indexOf(Cart.menu_items.find(item => { return (item.menu_item == postData.menu_item) }))].ingredients.sort();
            var newIngredients = dishOrdered.ingredients;
            if (JSON.stringify(oldIngredients) == JSON.stringify(newIngredients)) {
                console.log('first sub if')
                Cart.menu_items[Cart.menu_items.indexOf(Cart.menu_items.find(item => { return (item.menu_item == postData.menu_item) }))].quantity =
                    parseInt(Cart.menu_items[Cart.menu_items.indexOf(Cart.menu_items.find(item => { return (item.menu_item == postData.menu_item) }))].quantity) + parseInt(dishOrdered.quantity);
                Cart.menu_items[Cart.menu_items.indexOf(Cart.menu_items.find(item => { return (item.menu_item == postData.menu_item) }))].comment = dishOrdered.comment;
            } else {
                console.log('second sub if')
                Cart.menu_items.push(dishOrdered)
            }
        }
        await Carts.updateCartBysenderID(Cart)
        console.log('addFoodToCart', Cart, postData)
        await askMore(senderID, postData.quantity, dishOrdered)

        deferred.resolve({ 'status': 1 })
        return deferred.promise
    }
    var showDescription = async function (senderID, descriptionId) {
        console.log('showDescription', descriptionId, senderID)
        var dish = await Food.getFoodById(descriptionId)
        dish = dish[0]
        console.log('dish', dish)
        if (!dish.subtitle) {
            dish.subtitle = staticText.NO_DESCRIPTION
        } else if (dish.subtitle == '') {
            dish.subtitle = staticText.NO_DESCRIPTION
        }
        var message1 = fbTemplate.textMessage(dish.subtitle)
        await fbTemplate.reply(message1, senderID)
        var buttons = [];
        buttons[0] = fbTemplate.createWebViewButton(stripeUrl + senderID + '/menu_item/' + dish._id, staticText.ADD_TO_CART, 'TALL')
        var message2 = fbTemplate.buttonMessage(staticText.ORDER_AFTER_DETAIL_MESSAGE, buttons)
        var q1 = fbTemplate.createQuickReply(staticText.ADD_MORE_OPTIONS, constants.CATEGORIES)
        var q2 = fbTemplate.createQuickReply(staticText.VIEW_CART, constants.DISPLAY_CART)
        var qr = [q1, q2]
        return fbTemplate.reply(message2, senderID)

        var message = fbTemplate.quickReplyMessage(staticText.GREET1 + first_name + ', ' + staticText.GREET2 + '\n' + staticText.CHOOSE_OPTION, qr)
    }
    var smalltalk = function (text, senderID) {
        for (var i = 0; i < text.length; i++) {
            if (text[i].text.text[0] == '') {
                console.log('Empty text response from Dialog FLow')
            } else {
                var message = fbTemplate.textMessage(text[i].text.text[0])
                console.log("Text from: ", i, text[i].text.text[0])
                fbTemplate.reply(message, senderID)
            }
        }
    }

    var showDeliveryStatus = async (senderID) => {
        var order_data = await Delivery.getDeliveryIdByPsidAndStatus(senderID)
        var delivery_data = await Delivery.getDeliveryById(order_data.delivery_id)

        var buttons = [];

        if (delivery_data.status == "pending") {
            var delivery_status_message = "We've accepted the delivery and will be assigning it to a delivery guy."
        } else if (delivery_data.status == "pickup") {
            var delivery_status_message = "Delivery guy is assigned and is en route to pick up the items."
        } else if (delivery_data.status == "pickup_complete") {
            var delivery_status_message = "Delivery guy has picked up the items."
        } else if (delivery_data.status == "dropoff") {
            var delivery_status_message = "Delivery guy is moving towards the dropoff."
        } else if (delivery_data.status == "canceled") {
            var delivery_status_message = "Deliveries are either canceled by the customer or by our customer service team."
        } else if (delivery_data.status == "delivered") {
            var delivery_status_message = "Your order has been delivered successfully"
        }

        buttons[0] = fbTemplate.createPostBackButton(staticText.TRACK_ORDER_STATUS, constants.TRACK_ORDER_STATUS)
        buttons[1] = fbTemplate.createPostBackButton(staticText.START_NEW_ORDER, constants.CATEGORIES)
        console.log('entered into else', delivery_data.status)
        var message = fbTemplate.buttonMessage(delivery_status_message, buttons)

        return fbTemplate.reply(message, senderID)
    }

    var checkCart = async (senderID) => {
        return displayCategories(senderID)
        // var card_data = await Carts.findCartBysenderID(senderID)
        // if (!card_data.menu_items) {
        //     return editCartMessage(senderID)
        // } else if (card_data.menu_items == 0) {
        //     return editCartMessage(senderID)
        // }
        // else {
        //     return displayCategories(senderID)
        // }
    }
    var displayLocationAddress = (senderID) => {
        var qr1 = fbTemplate.createQuickReplyWithImage(staticText.PLACE_ORDER, constants.PLACE_ORDER, staticText.PLACE_ORDER_URL)
        var qr2 = fbTemplate.createQuickReplyWithImage(staticText.LOCATION_INFORMATION, constants.LOCATION_ADDRESS, staticText.LOCATION_INFORMATION_URL)
        var qr3 = fbTemplate.createQuickReplyWithImage(staticText.DEALS, constants.UNDER_CONSTRUCTION2, staticText.DEALS_URL)
        var qr = [qr1, qr2, qr3]
        var message = fbTemplate.quickReplyMessage(staticText.LOCATION_ADDRESS, qr)
        return fbTemplate.reply(message, senderID)
    }
    return {
        getStarted: getStarted,
        storeInitialAddress: storeInitialAddress,
        storePhoneNumber: storePhoneNumber,
        displayNearByOutlets: displayNearByOutlets,
        displayNearByOutletsBeginning: displayNearByOutletsBeginning,
        showNearByStoresBeginning: showNearByStoresBeginning,
        orderType: orderType,
        showStores: showStores,
        storeDeliveryAddress: storeDeliveryAddress,
        displayCategories: displayCategories,
        displayFoodOnCategory: displayFoodOnCategory,
        enterQuantity: enterQuantity,
        askMore: askMore,
        fetchPhoneNumber: fetchPhoneNumber,
        sendSuccessfullMessage: sendSuccessfullMessage,
        displayCart: displayCart,
        smalltalk: smalltalk,
        underConstruction: underConstruction,
        editCartMessage: editCartMessage,
        removeFromTemplate: removeFromTemplate,
        checkout: checkout,
        getLongLat: getLongLat,
        servicescurrentlyavailable: servicescurrentlyavailable,
        underConstruction2: underConstruction2,
        underConstruction3: underConstruction3,
        afterPaymentMessages: afterPaymentMessages,
        showDeliveryStatus: showDeliveryStatus,
        checkCart: checkCart,
        addFoodToCart: addFoodToCart,
        showDescription: showDescription,
        underConstruction4: underConstruction4,
        underConstruction5: underConstruction5,
        displayLocationAddress: displayLocationAddress,
        createCartItemDescriptionMessage: createCartItemDescriptionMessage,
        viewCartItemSpecification: viewCartItemSpecification
    }
}