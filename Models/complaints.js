'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ComplaintSchema = Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    description: String,
    invoice: String,
    justification: String,
    image: String,
    status: String
}, { versionKey: false });

module.exports = mongoose.model('Complaint', ComplaintSchema)