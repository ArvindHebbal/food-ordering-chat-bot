function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

define('GREET1', 'Hello ')
define('GREAT', 'Great! I have added ')
define('SHOW_ORDER1', ' units to your cart.\nWould you like to add another item?')
define('YES_CONFIRM', 'Yes')
define('NO_CONFIRM', 'No')
define('PAY_NOW', function(amount) { return ` 💳 Pay $${amount}`})
define('PAY_NOW0','Pay ')
define('GREET2', "Nice to meet you! \nI'm Burger&Brew Co, your food ordering assistant.\nHow may I help you?")
define('ASK_LOCATION1', 'Share your location and let\'s get started!')
define('SHARE', 'Share')
define('ENTER_ADDRESS', 'Please enter your address.')
define('ENTER_PHONE_NUMBER', 'Enter your phone number.')
define('NEARBY_OUTLETS1', 'Here are the nearby outlets for you:')
define('NEARBY_OUTLETS2', 'Here\'s a list of outlets delivering to your address:')
define('TYPE_OF_ORDER', 'How would you like to enjoy your meal?')
define('SEE_STORES', 'See stores')
define('DELIVERY', 'Delivery')
define('ONLINE', 'Order online & pick-up')
define('SHOW_STORES', 'These are the stores near you.')
define('CHECK_OUT', 'Check it out!')
define('VISIT', 'Visit')
define('DELIVERY_ADDRESS', 'Please share your delivery address here.')
define('SELECT_CATEGORY', 'Please select a food category to continue with your order.')
define('SALAD', '🥗 Salads')
define('BREAKFAST', '🥞 Breakfast')
define('BURGER', '🍔 Burgers')
define('ADD_TO_CART', '🛒 Add to cart')
define('ADD_MORE_OPTIONS', 'Add more items')
define('ENTER_QUANTITY', 'How many units would you like to order for this item?')
define('ASK_MORE', 'Do you need anything else?')
define('SELECT', 'Select')
define('EMPTY_CART_MESSAGE', 'Your cart is empty.')
define('UNDER_CONSTRUCTION', 'This feature is still under development. Please check back later.')
define('MAKE_RESERVATION', 'Make a reservation')
define('EDIT_CART', '✏️ Edit item')
define('EDIT_CART_MESSAGE', 'Here\'s your cart. You can always edit or remove items from the cart.')
define('EMPTY_CART', 'Your cart is empty. What would you like to add to your cart ?')
define('REMOVE_FROM_CART', '❌ Remove from cart')
define('BACK', 'Back 🔙')
define('CHECKOUT', 'Checkout')
define('WHAT_MORE', 'What more items would you like to add?')
define('ORDER_CONFIRMATION', function(orderNumber) { return `Your order with order id ${orderNumber} has been confirmed. We will keep you notified with the order status.` });
define('PAYMENT_AMOUNT_MESSAGE', function(amount) { return `Your total bill amount is $${amount}` });
define('PAYMENT_MESSAGE', 'You can continue to the payment section by clicking on the button given below:')
define('PLACE_ORDER', 'Place order');
define('PLACE_ORDER_URL', 'http://www.archanovo.com/resources/icon-form.png');
define('LOCATION_INFORMATION', 'Location info');
define('LOCATION_INFORMATION_URL', 'https://cdn4.iconfinder.com/data/icons/web-ui-color/128/Marker_red-512.png');
define('DEALS', 'Deals');
define('DEALS_URL', 'https://storage.googleapis.com/uploadimage01/burgersandbrewco/images.png');
define('ASK_LONG_LAT', 'Can you please share your location ?')
define('SERVICE_AVAILABLE_MESSAGE', 'Here\'s list of services currently delivering to your address.')
define('POSTMATES', 'Postmates')
define('UBEREATS', 'UberEats')
define('GRUBHUB', 'GrubHub')
define('INVALID_VALUE', 'You have entered in valid value. Please enter again\n')
define('CHOOSE_OPTION', 'Choose from the options given below to continue.')
define('TRACK_ORDER_STATUS', 'Track order status')
define('START_NEW_ORDER', 'Start new order')
define('CREATE_NEW_ORDER', 'Create new order')
define('VIEW_ORDER', 'View order')
define('VIEW_CART', '🛒 View cart')
define('VIEW_DESCRIPTION', 'View description')
define('NO_DESCRIPTION', 'No description available.')
define('ORDER_AFTER_DETAIL_MESSAGE', 'Order this item?')
define('LOCATION_ADDRESS','I am currently located at 950 N Elmhurst Rd, Mount Prospect, IL, US.')
define('FEEDBACK','Give feedback')
define('VIEW_SPECIFICATION','View specification')