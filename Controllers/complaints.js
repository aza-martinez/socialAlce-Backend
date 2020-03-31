'Use Strict'
let validator = require('validator');
let Complaint = require('../Models/complaints');
let Counter = require('../Models/counters');
let cript = require('bcrypt-nodejs');
let jwt = require ('../Middlewares/jwt');
let fs = require ('fs');
let path = require('path');
var moment = require('moment-timezone');
let mongoosePaginate = require('mongoose-pagination');var azure =  require('azure-storage');

const KEY_STORAGE = 'qxqCXxt8jH5QceYUPcECi45udcsdUlM9glFz/qwHmdvGRudsywFRoY1KNQex1gLlB6nCKvFiAM3rGK6+nQPqbg==';
const STORAGE_ACCOUNT = 'socialalcestorage';
const STORAGE_CONTAINER = 'complaints';
const URL_BASE_STORAGE = 'https://socialalcestorage.blob.core.windows.net/complaints';


var controller = {
    save: async(req, res) =>{
        Counter.findByIdAndUpdate({_id: 'complaints'}, {$inc: { invoice: 1} }, function(error, counter)   {
            if(error)
                return next(error);

        var params = req.body;
        let complaint = new Complaint();
        complaint.user = params.user;
        complaint.description = params.description;
        complaint.image = null;
        complaint.justification = params.justification;
        let fecha = new Date();
        let dateMX = moment(fecha).tz("America/Mexico_City");
        complaint.dateCreated = dateMX._d;
        complaint.dateIncidence = params.dateIncidence;
        complaint.status = 'PENDING';
        let last_invoice = counter.invoice+1;
        complaint.invoice = last_invoice;
        complaint.save((error, complaintStored) => {
                            if (error) return res.status(500).send();
                            if(complaintStored){
                                if(req.files){
                                    var file_path = req.files.image.path;
                                    var file_name = req.files.image.originalFilename;
                                    var extension_split = file_name.split('\.');
                                    var file_ext = extension_split[1];

                                    var rutaAzure = URL_BASE_STORAGE+'/'+file_name
                                    const blobService = azure.createBlobService(STORAGE_ACCOUNT, KEY_STORAGE);
                                    let fileStorage = null;
                                    const startDate = new Date();
                                    const expiryDate = new Date(startDate);
                                    const sharedAccessPolicy = {
                                        AccessPolicy: {
                                        Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
                                        start: startDate,
                                        Expiry: azure.date.minutesFromNow(20)
                                        }
                                    };
                                    blobService.createBlockBlobFromLocalFile(STORAGE_CONTAINER, file_name , file_path, async (e, result, req) => {
                                        if (e) {
                                            console.log('no se guardo...')
                                            return;
                                        }
                                        const token = blobService.generateSharedAccessSignature(STORAGE_CONTAINER, result.name, sharedAccessPolicy);
                                        const fileURLStorage = blobService.getUrl(STORAGE_CONTAINER, result.name, token, true);
                                        request(fileURLStorage, { encoding: null }, (error, response, body) => {})
                                    })
                                    if(file_ext == 'png' || file_ext == 'PNG' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
                                        Complaint.findOneAndUpdate({invoice: last_invoice}, {image: rutaAzure}, {new: true}, (err, complaintStored) =>{
                                            if(err) return res.status(500).send();
                                            if(!complaintStored) return res.status(404).send();
                                            res.status(200).send({user: complaintStored});
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
        Complaint.find({})
        .sort([['date', 'descending']])
        .exec((err, complaint) => {
                if (err) {
                    return res.status(500).send({err});
                }
                if (!complaint || complaint.length <= 0) {
                    return res.status(200).send('SIN SUGERENCIAS');
                }
                return res.status(200).send(complaint);
            });
        }
};
module.exports = controller;
