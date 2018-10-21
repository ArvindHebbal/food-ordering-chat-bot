var request = require("request"),
  Q = require("q"),
  fs = require('fs'),
  Users = require('./db/controller/users'),
  configuration = require('./configuration')

function call() {
  var PAGE_ACCESS_TOKEN = configuration.PAGE_ACCESS_TOKEN

  this.getUserProfile = function (userID) {
    console.log('getUserProfile', userID, PAGE_ACCESS_TOKEN)
    var deferred = Q.defer();
    var options = {
      method: 'GET',
      url: 'https://graph.facebook.com/v3.1/' + userID + '?fields=first_name,last_name&access_token=' + PAGE_ACCESS_TOKEN
    };
    console.log('url', options)
    request(options, async function (error, response, body) {
      if (error) {
        console.log(error)
        deferred.reject(error);
      } else {
        var user_data = await Users.findUserBysenderID(JSON.parse(body).id)
        console.log('user_data fetched', user_data)
        if (user_data) {
          deferred.resolve(user_data)

        }
        else {
          console.log('store data')
          user_data = JSON.parse(body)
          console.log('before', user_data)
          user_data.sender_id = user_data.id
          JSON.parse(body)['sender_id'] = user_data
          console.log('storing user: ', user_data)
          user_data = await Users.createUser(user_data)
          deferred.resolve(user_data)
        }
      }
    });
    return deferred.promise;
  }
}
module.exports = new call();