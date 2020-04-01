'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let SuggestionsSchema = Schema({
    user:  { type: Schema.ObjectId, ref: "User" },
    description: String,
    justification: String,
    justificationReject: String,
    dateCreated: Date,
    image: String,
    status: String,
    invoice: Number
}, { versionKey: false });

module.exports = mongoose.model('Suggestion', SuggestionsSchema)