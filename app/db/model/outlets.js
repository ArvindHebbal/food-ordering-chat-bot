'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Outlets = new Schema({
    title: { type: String },
    subtitle: { type: String },
    item_url: {type: String },
    image_url: { type: String },
    payload: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Outlets', Outlets);