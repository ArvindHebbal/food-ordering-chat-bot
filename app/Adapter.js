var Firebase = require("firebase");
var Q = require("q");


function Adapter() {
  if (this instanceof Adapter) {
    // this.db = mysql.createPool(options);
  } else {
    return new Adapter();
  }
}

Adapter.prototype.xyz = function(type) {
  
}

module.exports = Adapter;
