'use strict'

let jwt = require('jwt-simple');
let moment  = require('moment');
let secret = 'secret_key_itcom_developers_2020'
exports.createToken = function(user){
    let payload = {
        sub: user._id,
        name:  user.name,
        last_name:  user.last_name,
        nick:  user.nick,
        email:  user.email,
        role:  user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(2, 'hours').unix()
    };
    return jwt.encode(payload, secret);
}