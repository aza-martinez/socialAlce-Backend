
'Use Strict'
let validator = require('validator');
let Complaint = require('../Models/complaints');
let cript = require('bcrypt-nodejs');
let jwt = require ('../Middlewares/jwt');
let fs = require ('fs');
let path = require('path');
let mongoosePaginate = require('mongoose-pagination');

var controller = {
save: async(req, res) => {
var params = req.body;
let complaint = new Complaint();

complaint.user = params.user;
complaint.description = params.description;
complaint.invoice = params.invoice;
complaint.justification = params.justification;
complaint.image = null;
complaint.status = 'Pendiente';

complaint.save((error, complaintStored) => {
    if (error) return res.status(500).send();
    if(complaintStored){
        res.status(200).send({complaint: complaintStored});
    }else{
        res.status(400).send();
    }
})
},

update: async(req, res) => {
    let idComplaint = req.params.idComplaint;
    let update = req.body;
    Complaint.findByIdAndUpdate(idComplaint, update, {new:true}, (err, complaintUpdate) => {
        if(err) return res.status(500).send(err);
        if(!complaintUpdate) return res.status(404).send();
        return res.status(200).send({user: complaintUpdate});
    })
},

upload: async(req, res) => {
    let idUser = req.params.idUser;
    let idComplaint = req.params.idComplaint;
    if(req.files){
        console.log(req.files);
        let file_path = req.files.image.path;
        let file_split = file_path.split('\\');
        let  file_name = file_split[2];
        let ext_split = file_name.split('\.');
        let file_ext = ext_split[1];

        if(idUser != req.user.sub){
            return removeFilesOfUpload(res, file_path, 'Usuario Sin Permisos');
        }
        if(file_ext == 'png' || file_ext == 'PNG' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            Complaint.findByIdAndUpdate(idComplaint, {image: file_name}, {new: true}, (err, complaintUpdate) =>{
                if(err) return res.status(500).send();
                if(!complaintUpdate) return res.status(404).send();
                return res.status(200).send({user: complaintUpdate});
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
},

getImageFile(req, res){
    let imageFile = req.params.imageFile;
    let path_file = './uploads/complaints/'+imageFile;
    fs.exists(path_file, (exist) => {
        if(exist){
            res.sendFile(path.resolve(path_file));
        }else
        res.status(200).send({message: 'No Exixte La Imagen'});
    })
},

list: async(req, res) => {
    Complaint.find({})
    .sort([['date', 'descending']])
    .exec((err, complaints) => {
            if (err) {
                return res.status(500).send({err});
            }
            if (!complaints || complaints.length <= 0) {
                return res.status(200).send('SIN QUEJAS');
            }
            return res.status(200).send(complaints);
        });
    }
};
module.exports = controller;