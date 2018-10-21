'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Category = new Schema({
    name: { type: String },
    payload: { type: String },
    ingredients: [{ type: Schema.Types.ObjectId, ref: 'Ingredient' }]
}, { timestamps: true });

module.exports = mongoose.model('Category', Category);