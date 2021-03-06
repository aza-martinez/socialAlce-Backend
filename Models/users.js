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
    role: String,
    image: String,
    status: Boolean
}, { versionKey: false });

module.exports = mongoose.model('User', UserSchema)