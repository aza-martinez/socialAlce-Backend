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
const complaints = require('../Models/complaints');

const KEY_STORAGE = 'qxqCXxt8jH5QceYUPcECi45udcsdUlM9glFz/qwHmdvGRudsywFRoY1KNQex1gLlB6nCKvFiAM3rGK6+nQPqbg==';
const STORAGE_ACCOUNT = 'socialalcestorage';
const STORAGE_CONTAINER = 'complaints';
const URL_BASE_STORAGE = 'https://socialalcestorage.blob.core.windows.net/complaints';

/*ESTATUS DE LAS QUEJAS
    NEW
    PROCESS
    FINALIZED
    DISCARDED
*/
var controller = {
    save: async(req, res) =>{
        Counter.findByIdAndUpdate({_id: 'complaints'}, {$inc: { invoice: 1} }, function(error, counter)   {
            if(error)
                return next(error);

        var params = req.body;
        let complaint = new Complaint();
        complaint.user = params.user;
        complaint.anonymous = params.anonymous;
        complaint.description = params.description;
        complaint.image = null;
        complaint.justification = params.justification;
        let fecha = new Date();
        let dateMX = moment(fecha).tz("America/Mexico_City");
        complaint.dateCreated = dateMX._d;
        complaint.status = 'NEW';
        let last_invoice = counter.invoice+1;
        complaint.invoice = last_invoice;
        complaint.save((error, complaintStored) => {
            if (error) return res.status(500).send();
            if(complaintStored){
                    if (!req.files.image){
                    rutaAzure = null;
                    Complaint.findOneAndUpdate({invoice: last_invoice}, {image: rutaAzure}, {new: true}, (err, complaintStored) =>{
                        console.log(err);
                        if(err) return res.status(500).send();
                        if(!complaintStored) return res.status(404).send();
                        res.status(200).send({complaint: complaintStored});
                    });
                }
                if(req.files.image){
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
                    })
                    if(file_ext == 'png' || file_ext == 'PNG' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
                        Complaint.findOneAndUpdate({invoice: last_invoice}, {image: rutaAzure}, {new: true}, (err, complaintStored) =>{
                            if(err) return res.status(500).send();
                            if(!complaintStored) return res.status(404).send();
                            res.status(200).send({complaint: complaintStored});
                        });
                    }
                }
            }
        })
});
},



    update: async(req, res) => {
        let idComplaint = req.params.idComplaint;
    if(req.user.role != 'ROLE_ADMIN'){
    return res.status(500).send('NO TIENE PERMISOS');
    }
        let update = req.body;
        Complaint.findByIdAndUpdate(idComplaint, update, {new:true}, (err, complaintUpdate) => {
            if(err) return res.status(500).send(err);
            if(!complaintUpdate) return res.status(404).send();
            return res.status(200).send();
        })
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
