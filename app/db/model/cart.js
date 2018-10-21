'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Cart = new Schema({
    sender_id: { type: String },
    menu_items: [{
        menu_item: { type: Schema.Types.ObjectId, ref: 'Food' }, quantity: { type: String },
        ingredients: [{ type: Schema.Types.ObjectId, ref: 'Ingredient' }], comment: { type: String }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', Cart);