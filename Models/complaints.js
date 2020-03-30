'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ComplaintsSchema = Schema({
    user: String,
    description: String,
    justification: String,
    dateCreated: Date,
    dateIncidence: String,
    image: String,
    status: String,
    invoice: Number
}, { versionKey: false });

module.exports = mongoose.model('Complaint', ComplaintsSchema)