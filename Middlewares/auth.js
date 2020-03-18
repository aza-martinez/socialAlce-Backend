'use strict'

let jwt = require('jwt-simple');
let moment = require ('moment');
let secret = 'secret_key_itcom_developers_2020'

exports.ensureAuth = function(req, res, next){
    console.log(req.headers.authorization);
    if(!req.headers.authorization){
        return res.status(403).send('TOKEN NECESARIO');
    }
    let token = req.headers.authorization.replace(/['"]+/g, '');
    try {
        var payload = jwt.decode(token,secret);
        if(payload.exp <= moment().unix()){
            return res.status(401).send('TOKEN EXPIRADO');
        }
    } catch (ex) {
        return res.status(401).send('TOKEN NO VALIDO');
    }
    console.log(payload);
    req.user = payload;
    next();
}