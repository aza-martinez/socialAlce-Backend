'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = Schema({
    name: String,
    last_name: String,
    nick: String,
    email: String,
    password: String,
    role: String,
    image: String
}, { versionKey: false });

module.exports = mongoose.model('User', UserSchema)