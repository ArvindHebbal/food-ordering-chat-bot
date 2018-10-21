'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Users = new Schema({
    first_name: { type: String },
    last_name: { type: String },
    sender_id: { type: String },
    phone: { type: Number },
    location: {
        long: { type: String },
        lat: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('Users', Users);
