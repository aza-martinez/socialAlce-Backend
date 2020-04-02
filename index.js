'use strict'

let mongoose = require('mongoose');
let app = require ('./app');
const port = process.env.PORT || 8080;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://srendon:20141530@cluster0-x8phq.azure.mongodb.net/socialGA', {useUnifiedTopology: true , useNewUrlParser: true, useFindAndModify: false})
    .then(() => {
        app.listen(port,() =>{});
        console.log("Conectado A socialGA En El Puerto: " + port);
    }).catch(error => console.log(error));