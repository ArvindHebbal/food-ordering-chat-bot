'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Ingredient = new Schema({
    name: { type: String },
    type: { type: String },
    price: { type: Number },
    choice: {type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Ingredient', Ingredient);