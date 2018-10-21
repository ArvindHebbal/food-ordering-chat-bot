var configuration = require('./configuration'),
  messenger = require('./messenger'),
  api = require('./api'),
  foo = require('./implementation'),
  implement = foo()

module.exports = {
  configure: function(app) {
    /*
     * Use your own validation token. Check that the token used in the Webhook 
     * setup is the same token used here.
     *
     */
    app.get('/webhook', function(req, res) {
      if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === configuration.VALIDATION_TOKEN) {
        console.log("Validated webhook");
        res.status(200).send(req.query['hub.challenge']);
      } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
      }
    });

    /*
     * All callbacks for Messenger are POST-ed. They will be sent to the same
     * webhook. Be sure to subscribe your app to your page to receive callbacks
     * for your page. 
     * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
     *
     */
    app.post('/webhook', function(req, res) {
      var data = req.body;

      // Make sure this is a page subscription
      if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function(pageEntry) {
          var pageID = pageEntry.id;
          var timeOfEvent = pageEntry.time;

          // Iterate over each messaging event
          if(pageEntry.messaging)
          pageEntry.messaging.forEach(function(messagingEvent) {
            if (messagingEvent.optin) {
              messenger.receivedAuthentication(messagingEvent);
            } else if (messagingEvent.message) {
              messenger.receivedMessage(messagingEvent);
            } else if (messagingEvent.delivery) {
              messenger.receivedDeliveryConfirmation(messagingEvent);
            } else if (messagingEvent.postback) {
              messenger.receivedPostback(messagingEvent);
            } else if (messagingEvent.read) {
              messenger.receivedMessageRead(messagingEvent);
            } else if (messagingEvent.account_linking) {
              messenger.receivedAccountLink(messagingEvent);
            } else {
              console.log("Webhook received unknown messagingEvent: ", messagingEvent);
            }
          });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know you've 
        // successfully received the callback. Otherwise, the request will time out.
        res.sendStatus(200);
      }
    });

    /*
     * This path is used for account linking. The account linking call-to-action
     * (sendAccountLinking) is pointed to this URL. 
     * 
     */
    app.get('/authorize', function(req, res) {
      var accountLinkingToken = req.query.account_linking_token;
      var redirectURI = req.query.redirect_uri;

      // Authorization Code should be generated per user by the developer. This will 
      // be passed to the Account Linking callback.
      var authCode = "1234567890";

      // Redirect users to this URI on successful login
      var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

      res.render('authorize', {
        accountLinkingToken: accountLinkingToken,
        redirectURI: redirectURI,
        redirectURISuccess: redirectURISuccess
      });
    });

  }
};
