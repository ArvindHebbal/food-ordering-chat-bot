var constants = require("./payload"),
  foo = require('./implementation'),
  externalApi = require('./api'),
  Q = require('q'),
  implement = foo();

function HandlePayload(payload, senderID) {
  console.log('HandlePayload', payload)
  if (payload == constants.GET_STARTED) {
    implement.getStarted(senderID)
  }
  else if (payload == constants.SHARE) {
    // implement.getStarted(senderID)
    console.log('share clicked', payload, senderID)
    implement.storeInitialAddress(senderID)
  } else if (payload == constants.DISPLAY_NEARBY_OUTLETS) {
    console.log('clicked', payload, senderID)
    implement.displayNearByOutlets(senderID)
  } else if (payload == constants.NEARBY_OUTLETS) {
    console.log('NEARBY_OUTLET clicked', payload, senderID)
    implement.orderType(senderID)
  } else if (payload == constants.SEE_STORES) {
    console.log('clicked', payload, senderID)
    implement.showStores(senderID)
  } else if (payload == constants.DELIVERY) {
    console.log('clicked', payload, senderID)
    implement.getLongLat(senderID)
  } else if (payload == constants.CATEGORIES) {
    console.log('clicked', payload, senderID)
    implement.displayCategories(senderID)
  }
  else if (payload == constants.UNDER_CONSTRUCTION) {
    implement.underConstruction(senderID)
  }
  else if (payload == constants.UNDER_CONSTRUCTION2) {
    implement.underConstruction2(senderID)
  }
  else if (payload == constants.UNDER_CONSTRUCTION3) {
    implement.underConstruction3(senderID)
  }
  else if (payload == constants.UNDER_CONSTRUCTION4) {
    implement.underConstruction4(senderID)
  }
  else if (payload == constants.UNDER_CONSTRUCTION5) {
    implement.underConstruction5(senderID)
  }
  else if (payload == constants.DISPLAY_CART) {
    implement.editCartMessage(senderID)
  }
  else if (payload == constants.PLACE_ORDER) {
    implement.orderType(senderID)
  }

  else if (payload.indexOf(constants.CATEGORY) != -1) {
    var selectedCategoryId = payload.split('-')[1]
    implement.displayFoodOnCategory(senderID, selectedCategoryId)
  } else if (payload == constants.SHOW_CART) {
    console.log('clicked', payload, senderID)
    implement.displayCart(senderID)
  }

  else if (payload.indexOf(constants.NEARBY_OUTLET) != -1) {
    implement.displayCategories(payload, senderID)
  }
  else if (payload.indexOf(constants.VIEW_SPECIFICATION) != -1) {
    var cartId = payload.split('-')[1]
    var itemId = payload.split('-')[2]
    implement.viewCartItemSpecification(senderID, cartId, itemId)
  }
  else if (payload.indexOf('ADD_TO_CART') != -1) {
    implement.enterQuantity(payload, senderID)
  }
  else if (payload.indexOf('EDIT_IN_CART') != -1) {
    implement.enterQuantity(payload, senderID)
  }
  else if (payload.indexOf(constants.REMOVE_FROM_CART) != -1) {
    var removalId = payload.split('-')[1]
    implement.removeFromTemplate(senderID, removalId)
  }
  else if (payload.indexOf(constants.VIEW_DESCRIPTION) != -1) {
    var descriptionId = payload.split('-')[1]
    implement.showDescription(senderID, descriptionId)
  }
  else if (payload == constants.CHECK_OUT) {
    implement.checkout(senderID)
  }
  else if (payload == constants.TRACK_ORDER_STATUS) {
    implement.showDeliveryStatus(senderID)
  } else if (payload == constants.CHECK_CART) {
    implement.checkCart(senderID)
  } else if(payload == constants.LOCATION_ADDRESS) {
    implement.displayLocationAddress(senderID)
  } else if(payload == 'NOT_DEFINED') {
    implement.underConstruction2(senderID)
  }


  else {
    console.log('No action found for this payload', payload)
  }
}

exports.HandlePayload = HandlePayload
