'use strict'
let express = require('express');
let UsersController = require('../Controllers/users');
let router = express.Router();
let auth = require('../Middlewares/auth');
let multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

router.get('/user/', auth.ensureAuth, UsersController.listUser);
router.get('/user/list/', auth.ensureAuth, UsersController.list);
router.get('/users/:page?',  auth.ensureAuth, UsersController.loginUser);
router.get('/user/search/:idUser', auth.ensureAuth, UsersController.search);
router.post('/user/save/', [auth.ensureAuth, multipartMiddleware], UsersController.save);
router.post('/user/login/', UsersController.login);
router.put('/user/update/:idUser', auth.ensureAuth, UsersController.update);
router.put('/user/delete/:idUser', auth.ensureAuth, UsersController.delete);
router.post('/user/upload/:idUser', [auth.ensureAuth, multipartMiddleware], UsersController.upload);
router.get('/user/getImage/:imageFile', UsersController.getImageFile);

module.exports = router;