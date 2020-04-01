'use strict'
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

var CounterSchema = Schema({
    _id: {type: String, required: true},
    invoice: { type: Number, default: 0 }
}, { versionKey: false });

module.exports = mongoose.model('Counter', CounterSchema)