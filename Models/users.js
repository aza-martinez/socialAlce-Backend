'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = Schema({
    name: String,
    last_name: String,
    nick: String,
    email: String,
    birthday: String,
    dateCreated: Date,
    password: String,
    role: Boolean,
    image: String,
    status: String
}, { versionKey: false });

module.exports = mongoose.model('User', UserSchema)