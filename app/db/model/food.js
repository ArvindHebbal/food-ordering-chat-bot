'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Food = new Schema({
    title: { type: String },
    subtitle: { type: String },
    item_url: {type: String },
    image_url: { type: String },
    price: {type: String},
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    payload: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Food', Food);