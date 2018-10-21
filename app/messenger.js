'use strict';
var configuration = require('./configuration'),
    fbTemplate = require('./fbTemplate'),
    crypto = require('crypto'),
    foo = require('./implementation'),
    implement = foo(),
    Q = require("q"),
    fs = require('fs'),
    dialogflow = require("dialogflow"),
    externalApi = require('./api'),
    Handler = require("./Handler"),
    constants = require("./payload"),
    Users = require('./db/controller/users'),
    Carts = require("./db/controller/cart"),
    Address = require('./db/controller/address'),
    Delivery = require('./db/controller/delivery'),
    staticText = require("./staticText"),
    _ = require("underscore")

/* DialogfLow credentials */
const projectId = configuration.PROJECT_ID;
const languageCode = configuration.LANGUAGE;

/* Instantiate a DialogFlow client */
const sessionClient = new dialogflow.SessionsClient({
    projectId,
    keyFilename: configuration.KEY_FILENAME
})

/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 */
function verifyRequestSignature(req, res, buf) {
    var signature = req.headers["x-hub-signature"];

    if (!signature) {
        // For testing, let's log an error. In production, you should throw an 
        // error.
        console.error("Couldn't validate the signature.");
    } else {
        var elements = signature.split('=');
        var method = elements[0];
        var signatureHash = elements[1];

        var expectedHash = crypto.createHmac('sha1', configuration.APP_SECRET)
            .update(buf)
            .digest('hex');

        if (signatureHash != expectedHash) {
            throw new Error("Couldn't validate the request signature.");
        }
    }
}

/*
 * Authorization Event
 * The value for 'optin.ref' is defined in the entry point. For the "Send to 
 * Messenger" plugin, it is the 'data-ref' field. Read more at 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 */
function receivedAuthentication(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfAuth = event.timestamp;

    // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
    // The developer can set this to an arbitrary value to associate the 
    // authentication callback with the 'Send to Messenger' click event. This is
    // a way to do account linking when the user clicks the 'Send to Messenger' 
    // plugin.
    var passThroughParam = event.optin.ref;

    console.log("Received authentication for user %d and page %d with pass " +
        "through param '%s' at %d", senderID, recipientID, passThroughParam, timeOfAuth);

    // When an authentication is received, we'll send a message back to the sender
    // to let them know it was successful.
    // sendTextMessage(senderID, "Authentication successful");
    var message = fbTemplate.textMessage('Authentication successful')
    fbTemplate.reply(message, senderID)
}

/*
 * Message Event
 * This event is called when a message is sent to your page. The 'message' 
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 * For this example, we're going to echo any text that we get. If we get some 
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've 
 * created. If we receive a message with an attachment (image, video, audio), 
 * then we'll simply confirm that we've received the attachment.
 */
async function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("\nReceived message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
    // console.log('and the event was \n', event)
    var isEcho = message.is_echo;
    var messageId = message.mid;
    var appId = message.app_id;
    var metadata = message.metadata;
    // You may get a text or attachment but not both
    var messageText = message.text;
    var messageAttachments = message.attachments;
    var quickReply = message.quick_reply;

    var sessionId = findOrCreateSession(senderID)
    if (isEcho) {
        // Just logging message echoes to console
        // console.log("\nReceived echo for message %s and app %d with metadata %s", messageId, appId, metadata);
        return;
    } else if (quickReply) {
        var quickReplyPayload = quickReply.payload;
        console.log("\nQuick reply for message %s with payload %s", messageId, quickReplyPayload);

        Handler.HandlePayload(quickReplyPayload, senderID)
        return;
    }

    if (messageText) {
        console.log('messageText', messageText)
        // Define session path
        const sessionPath = sessionClient.sessionPath(projectId, sessionId);

        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: messageText,
                    languageCode: languageCode,
                },
            },
        };

        // Detect intent name on the basis of text query entered by user
        sessionClient
            .detectIntent(request)
            .then(responses => {
                const result = responses[0].queryResult;
                console.log('Detected intent',result.action);

                return findContext(senderID)
                    .then(async function(context) {
                        console.log('context avail', context, messageText)
                        if (JSON.stringify(context) == JSON.stringify({})) {
                            /* Check the action sent by DialogFlow */
                            if (result.action == "input.welcome") {
                                // Welcome Intent Triggered
                                return implement.getStarted(senderID)
                            } else if (result.action.indexOf("smalltalk") != -1) {
                                // Smalltalk Intent Triggered
                                return implement.smalltalk(result.fulfillmentMessages, senderID)
                            } else if (result.action == "input.order") {
                                // Action to implement Start ordering flow
                                implement.orderType(senderID)
                            } else if (result.action == "input.my_cart") {
                                // Action to display my cart items
                                implement.editCartMessage(senderID)
                            } else if (result.action == "input.delivery") {
                                // Bot flow to start food ordering from delivery section
                                implement.getLongLat(senderID)
                            } else if (result.action == "input.unknown") {
                                // Handling Unknown default fallback intent
                                implement.smalltalk(result.fulfillmentMessages, senderID)
                            } else if (result.action == "input.track_order") {
                                // Action to show order status
                                implement.showDeliveryStatus(senderID)
                            } else if (result.action == "input.checkout") {
                                // Take user to checkout section
                                implement.editCartMessage(senderID)
                            } else if (result.action == "input.location") {
                                // Action to implement Location            
                                implement.displayLocationAddress(senderID)
                            }

                            // if (result.action == "input.unknown") {
                            //     // Welcome Intent Triggered

                            //     return implement.getStarted(senderID)
                            // }
                        } else {
                            //To store users address entered at the initial of chat
                            if (context == 'ShareInitialAddress') {
                                console.log(context)
                                console.log(messageText)
                                deleteContext(senderID)
                                // var data = fs.readFileSync('app/data.json', 'utf8');
                                var users = JSON.parse(data);
                                if (users[senderID]) {
                                    console.log('store data')

                                    users[senderID].initial_address = messageText;
                                    console.log('usersFullData', users)
                                    var strigifiedData = JSON.stringify(users, null, 2);
                                    // fs.writeFile('app/data.json', strigifiedData, finished)
                                    // function finished(err) {
                                    //   console.log('all set', err)
                                    // }
                                    return implement.storePhoneNumber(senderID)

                                }
                            } else if (context == 'StorePhoneNumber') {
                                //To store users phone number
                                deleteContext(senderID)
                                var user_data = await Users.findUserBysenderID(senderID)
                                if (user_data) {
                                    console.log('store data')
                                    user_data['phone'] = messageText;
                                    console.log('usersFullData', user_data)
                                    user_data = await Users.updateUserBysenderID(user_data)
                                }
                                return implement.orderType(senderID)
                            } else if (context == 'StoreDeliveryAddress') {
                                //To store delivery addess
                                deleteContext(senderID)
                                var address_data = await Address.findAddressByPSID(senderID)
                                if (!address_data) {
                                    var address = {
                                        address: messageText,
                                        sender_id: senderID
                                    }
                                    var address_data = await Address.createUserAddress(address)
                                    return implement.servicescurrentlyavailable(senderID)
                                } else {
                                    address_data.address = messageText;
                                    await Address.updateAddressBysenderID(address_data)
                                    return implement.servicescurrentlyavailable(senderID)
                                }
                            } else if (context.indexOf('ADD_TO_CART') != -1) {
                                //Add data to the cart
                                if (isNaN(messageText)) {
                                    var message = fbTemplate.textMessage(staticText.INVALID_VALUE + staticText.ENTER_QUANTITY)
                                    return fbTemplate.reply(message, senderID)
                                } else {
                                    deleteContext(senderID)
                                    var menu_item_id = context.split('-')[1]
                                    var Cart = await Carts.findCartBysenderID(senderID)
                                    if (!Cart) {
                                        Cart = await Carts.createCart({ sender_id: senderID, menu_items: [] })
                                    }
                                    var dishOrdered = Cart.menu_items.find(item => { return (item.menu_item == menu_item_id) })
                                    console.log('dishOrdered', dishOrdered, menu_item_id, Cart.menu_items)
                                    if (!dishOrdered) {
                                        dishOrdered = { 'menu_item': menu_item_id, 'quantity': messageText };
                                        Cart.menu_items.push(dishOrdered)
                                    } else {
                                        console.log('\ndishOrderedQuantity1', dishOrdered)
                                        // dishOrdered.quantity = parseInt(dishOrdered.quantity) + parseInt(messageText);
                                        Cart.menu_items[Cart.menu_items.indexOf(dishOrdered)].quantity = parseInt(Cart.menu_items[Cart.menu_items.indexOf(dishOrdered)].quantity) + parseInt(messageText);
                                        dishOrdered.quantity = Cart.menu_items[Cart.menu_items.indexOf(dishOrdered)].quantity;
                                    }
                                    await Carts.updateCartBysenderID(Cart)
                                    console.log('EnterQuantity', context, senderID, Cart)
                                    return implement.askMore(senderID, messageText, dishOrdered)
                                }
                            } else if (context.indexOf('EDIT_IN_CART') != -1) {
                                //Edit in the cart
                                if (isNaN(messageText)) {
                                    var message = fbTemplate.textMessage(staticText.INVALID_VALUE + staticText.ENTER_QUANTITY)
                                    return fbTemplate.reply(message, senderID)
                                } else {
                                    deleteContext(senderID)
                                    var menu_item_id = context.split('-')[1]
                                    var Cart = await Carts.findCartBysenderID(senderID)
                                    if (!Cart) {
                                        Cart = await Carts.createCart({ sender_id: senderID, menu_items: [] })
                                    }
                                    var dishOrdered = Cart.menu_items.find(item => { return (item._id == menu_item_id) })
                                    console.log('dishOrdered', dishOrdered, menu_item_id, Cart.menu_items)
                                    if (!dishOrdered) {
                                        dishOrdered = { 'menu_item': menu_item_id, 'quantity': messageText };
                                        Cart.menu_items.push(dishOrdered)
                                    } else {
                                        dishOrdered.quantity = messageText;
                                        Cart.menu_items[Cart.menu_items.indexOf(dishOrdered)].quantity = messageText;
                                    }
                                    await Carts.updateCartBysenderID(Cart)
                                    console.log('EnterQuantity', context, senderID, Cart)
                                    return implement.askMore(senderID, messageText, dishOrdered)
                                }
                            }
                        }
                    })
            })
            .catch(err => {
                console.error('ERROR:', err);
            });
        // if (messageText.toUpperCase() == "HI" || messageText.toUpperCase() == "HEY" || messageText.toUpperCase() == "HELLO") {
        //   console.log(messageText)
        //   implement.getStarted(senderID)
        // }

    } else if (messageAttachments) {
        messageAttachments = messageAttachments[0]
        console.log('has an attachment', messageAttachments)
        if (messageAttachments.type == 'location') {
            //Add users location
            var user_data = await Users.findUserBysenderID(senderID)
            if (user_data) {
                console.log('store data')
                user_data['location'] = messageAttachments.payload.coordinates;
                console.log('usersFullData', user_data)
                user_data = await Users.updateUserBysenderID(user_data)
                // return implement.storePhoneNumber(senderID)
                // return implement.orderType(senderID)
                return implement.storeDeliveryAddress(senderID)
            }
        }
    }
}

const sessions = {};

const findOrCreateSession = (fbid) => {
    console.log('findOrCreateSession ' + fbid)
    let sessionId;
    Object.keys(sessions).forEach(k => {
        if (sessions[k].fbid === fbid) {
            sessionId = k;
        }
    });
    if (!sessionId) {
        sessionId = new Date().toISOString();
        sessions[sessionId] = { fbid: fbid, context: {} };
    }
    // Let's see if we already have a session for the user fbid
    return sessionId;
};

/*
 * Delivery Confirmation Event
 * This event is sent to confirm the delivery of a message. Read more about 
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 */
function receivedDeliveryConfirmation(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var delivery = event.delivery;
    var messageIDs = delivery.mids;
    var watermark = delivery.watermark;
    var sequenceNumber = delivery.seq;

    if (messageIDs) {
        messageIDs.forEach(function(messageID) {
            // console.log("Received delivery confirmation for message ID: %s", messageID);
        });
    }
    console.log("All message before %d were delivered.", watermark);
}

/*
 * Postback Event
 * This event is called when a postback is tapped on a Structured Message. 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 */
function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback 
    // button for Structured Messages. 
    var payload = event.postback.payload;

    console.log(payload, timeOfPostback);
    // console.log("Received postback for user %d and page %d with payload '%s' at %d", senderID, recipientID, payload, timeOfPostback);

    // When a postback is called, we'll send a message back to the sender to 
    // let them know it was successful
    Handler.HandlePayload(payload, senderID)
}

/*
 * Message Read Event
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 */
function receivedMessageRead(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;

    // All messages before watermark (a timestamp) or sequence have been seen.
    var watermark = event.read.watermark;
    var sequenceNumber = event.read.seq;

    // console.log("Received message read event for watermark %d and sequence number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 */
function receivedAccountLink(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;

    var status = event.account_linking.status;
    var authCode = event.account_linking.authorization_code;
    console.log("Received account link event with for user %d with status %s and auth code %s ", senderID, status, authCode);
}

const findContext = (fbid) => {
    var deferred = Q.defer();
    var sessionId = findOrCreateSession(fbid)
    if (sessions[sessionId].context) {
        deferred.resolve(sessions[sessionId].context)
    }
    return deferred.promise;
};
const deleteContext = (fbid) => {
    var deferred = Q.defer();
    var sessionId = findOrCreateSession(fbid)
    if (sessions[sessionId].context) {
        sessions[sessionId].context = {}
        deferred.resolve(sessions[sessionId].context)
    }
    return deferred.promise;
};
const setFreeTextContext = (context, fbid) => {
    var deferred = Q.defer();
    console.log(fbid)
    console.log('[messenger.js - 39]', context)
    var sessionId = findOrCreateSession(fbid)
    // console.log()
    sessions[sessionId].context = context
    deferred.resolve(sessions[sessionId].context)
    return deferred.promise;
}

exports.verifyRequestSignature = verifyRequestSignature;
exports.receivedAuthentication = receivedAuthentication;
exports.receivedMessage = receivedMessage;
exports.receivedMessageRead = receivedMessageRead;
exports.receivedDeliveryConfirmation = receivedDeliveryConfirmation;
exports.receivedPostback = receivedPostback;
exports.receivedAccountLink = receivedAccountLink;
exports.findOrCreateSession = findOrCreateSession;
exports.setFreeTextContext = setFreeTextContext;