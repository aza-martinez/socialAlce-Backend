'Use Strict'
let validator = require('validator');
let User = require('../Models/users');
let cript = require('bcrypt-nodejs');
let jwt = require ('../Middlewares/jwt');
let fs = require ('fs');
let path = require('path');
var moment = require('moment-timezone');
let mongoosePaginate = require('mongoose-pagination');
var azure =  require('azure-storage');

const KEY_STORAGE = 'qxqCXxt8jH5QceYUPcECi45udcsdUlM9glFz/qwHmdvGRudsywFRoY1KNQex1gLlB6nCKvFiAM3rGK6+nQPqbg==';
const STORAGE_ACCOUNT = 'socialalcestorage';
const STORAGE_CONTAINER = 'users';
const URL_BASE_STORAGE = 'https://socialalcestorage.blob.core.windows.net/users';

var controller = {
login: async(req, res) => {
    var params = req.body;
    let email = params.email;
    let password = params.password;

    User.findOne({email: email},(err, user) => {
        if (err) return res.status(500).send();
        console.log(user);
        if (user){
            cript.compare(password, user.password, (err, check) => {
                if(check){

                    if(params.getToken){
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                        user.password = undefined;
                        return res.status(200).send({user})
                    }
                }else{
                    return res.status(400).send('Datos No Validos.');
                }
            });
        }else{
            return res.status(400).send('Usuario No Encontrado.');
        }
    })
},

save: async(req, res) =>{
let idUser = req.params.idUser;
if(req.user.role != 'ROLE_ADMIN'){
return res.status(500).send('NO TIENE PERMISOS');
}
var params = req.body;
let user = new User();
    user.name = params.name;
    user.last_name = params.last_name;
    user.nick = params.nick;
    user.email = params.email;
    user.birthday = params.birthday;
    user.status = true;
    user.role = params.role;
    user.image = null;
    let fecha = new Date();
    let dateMX = moment(fecha).tz("America/Mexico_City");
    user.dateCreated = dateMX._d;
    let nickUser = params.email;
    User.find({ $or: [
        {email: user.email.toLowerCase()},
        {nick: user.nick.toLowerCase()}
    ]}).exec((err, userFind) => {
        if (err) return res.status(500).send();
        if (userFind && userFind.length >= 1){
            return res.status(200).send('El Usuario Ya Se Encuentra Registrado Con Ese EMAIL/NICKNAME');
        }else{
            cript.hash(params.password, null, null, (error, hash)=>{
                user.password = hash;
                user.save((error, userStored) => {
                    if (error) return res.status(500).send();
                    if(userStored){
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
                                User.findOneAndUpdate({email: nickUser}, {image: rutaAzure}, {new: true}, (err, userStored) =>{
                                })
                                    if(err) return res.status(500).send();
                                    if(!userStored) return res.status(404).send();
                                    res.status(200).send({user: userStored});
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

        }
    });
},

search: async(req, res) => {
    let idUser = req.params.idUser;
if(req.user.role != 'ROLE_ADMIN' && idUser != req.user.sub){
return res.status(500).send('NO TIENE PERMISOS');
}
    User.findById(idUser, (err, userFind) => {
    })
        .sort([
            ['date', 'descending']
        ])
        .exec((err, userFind) => {
            if (err) {
                return res.status(500).send({});
            }
            if (!userFind || userFind.length <= 0) {
                return res.status(404).send({});
            }
            userFind.password = undefined;
            return res.status(200).send({ userFind });
        });
},

update: async(req, res) => {
    let idUser = req.params.idUser;
if(req.user.role != 'ROLE_ADMIN' && idUser != req.user.sub){
return res.status(500).send('NO TIENE PERMISOS');
}
    let update = req.body;
    delete update.password;
    User.findByIdAndUpdate(idUser, update, {new:true}, (err, userUpdate) => {
        if(err) return res.status(500).send(err);
        if(!userUpdate) return res.status(404).send();
        return res.status(200).send({user: userUpdate});
    })
},

delete: async(req, res) => {
    let idUser = req.params.idUser;
if(req.user.role != 'ROLE_ADMIN' && idUser != req.user.sub){
return res.status(500).send('NO TIENE PERMISOS');
}
    let statusDesactive = false;
    User.findByIdAndUpdate(idUser, {status: statusDesactive}, {new:true}, (err, userUpdate) => {
        if(err) return res.status(500).send(err);
        if(!userUpdate) return res.status(404).send();
        return res.status(200).send({user: userUpdate});
    })
},

upload: async(req, res) => {
    let idUser = req.params.idUser;
    if(req.user.role != 'ROLE_ADMIN' && idUser != req.user.sub){
        return res.status(500).send('NO TIENE PERMISOS');
    }
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
            User.findByIdAndUpdate(idUser, {image: file_name}, {new: true}, (err, userUpdate) =>{
                if(err) return res.status(500).send();
                if(!userUpdate) return res.status(404).send();
                return res.status(200).send({user: userUpdate});
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
    let path_file = './uploads/users/'+imageFile;
    fs.exists(path_file, (exist) => {
        if(exist){
            res.sendFile(path.resolve(path_file));
        }else
        res.status(200).send({message: 'No Exixte La Imagen'});
    })
},

loginUser: async(req, res) => {
    let identity_user_id = req.userFind.sub;
    let items = itemsPerPage = 5;
    let page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    User.find().sort('_id').paginate(page, itemsPerPage, (error, users, total) => {
        if (error) return res.status(500).send();
        if (!users) return res.status(400).send();
        users[0].password = undefined;
        return res.status(200).send({
            users,
            total,
            pages: Math.ceil(total/itemsPerPage)
        });
    });
},

listUser: async(req, res) => {
        req.user.sub =  undefined;
        req.user.iat = undefined;
        req.user.exp = undefined;
        return res.status(200).send(req.user);
},

list: async(req, res) => {
    User.find({})
    .sort([['date', 'descending']])
    .exec((err, users) => {
            if (err) {
                return res.status(500).send({err});
            }
            if (!users || users.length <= 0) {
                return res.status(200).send('SIN USUARIOS');
            }
            users.password = undefined;
            return res.status(200).send(users);
        });
    }
};
module.exports = controller;