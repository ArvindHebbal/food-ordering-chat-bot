'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Address = new Schema({
    address: { type: String },
    sender_id: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Address', Address);