'Use Strict'
let validator = require('validator');
let Suggestion = require('../Models/suggestions');
let Counter = require('../Models/counters');
let cript = require('bcrypt-nodejs');
let jwt = require ('../Middlewares/jwt');
let fs = require ('fs');
let path = require('path');
var moment = require('moment-timezone');
let mongoosePaginate = require('mongoose-pagination');
var controller = {
    save: async(req, res) =>{
        Counter.findByIdAndUpdate({_id: 'suggestions'}, {$inc: { invoice: 1} }, function(error, counter)   {
            if(error)
                return next(error);

        var params = req.body;
        let suggestion = new Suggestion();
        suggestion.user = params.user;
        suggestion.description = params.description;
        suggestion.image = null;
        suggestion.justification = params.justification;
        let fecha = new Date();
        let dateMX = moment(fecha).tz("America/Mexico_City");
        suggestion.dateCreated = dateMX._d;
        suggestion.status = 'PENDING';
        let last_invoice = counter.invoice+1;
        suggestion.invoice = last_invoice;
        suggestion.save((error, suggestionStored) => {
                            if (error) return res.status(500).send();
                            if(suggestionStored){
                                if(req.files){
                                    let file_path = req.files.image.path;
                                    let file_split = file_path.split('\\');
                                    let  file_name = file_split[2];
                                    let ext_split = file_name.split('\.');
                                    let file_ext = ext_split[1];
                                    if(file_ext == 'png' || file_ext == 'PNG' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
                                        Suggestion.findOneAndUpdate({invoice: last_invoice}, {image: file_name}, {new: true}, (err, suggestionStored) =>{
                                            if(err) return res.status(500).send();
                                            if(!suggestionStored) return res.status(404).send();
                                            res.status(200).send({user: suggestionStored});
                                        });
                                    }else{
                                        return removeFilesOfUpload(res, file_path, 'Extensión No Valida');
                                    }
                                }else{
                                    return res.status(200).send({message: 'No Seleccionaste Archivos'});
                                }
                                function removeFilesOfUpload(res, file_path, message){
                                    fs.unlink(file_path, (err) => {
                                        return res.status(200).send({message: message});
                                    });
                                }
                            }else{
                                res.status(400).send();
                            }
                        })
        });
        },


    list: async(req, res) => {
        Suggestion.find({})
        .sort([['date', 'descending']])
        .exec((err, suggestion) => {
                if (err) {
                    return res.status(500).send({err});
                }
                if (!suggestion || suggestion.length <= 0) {
                    return res.status(200).send('SIN SUGERENCIAS');
                }
                return res.status(200).send(suggestion);
            });
        }
};
module.exports = controller;
