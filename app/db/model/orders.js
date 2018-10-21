'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Order = new Schema({
    sender_id: { type: String },
    delivery_id: { type: String },
    menu_items: [{ menu_item: { type: Schema.Types.ObjectId, ref: 'Food' }, quantity: { type: String } }],
    comment: { type: String }, status: { type: String, default: 'pending' },
    is_delivered: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', Order);