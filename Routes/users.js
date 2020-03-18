'use strict'
let express = require('express');
let UsersController = require('../Controllers/users');
let router = express.Router();
let auth = require('../Middlewares/auth');
let multipart = require('connect-multiparty');
let uploadImage = multipart({uploadDir: './uploads/users'});

router.get('/user/list/', auth.ensureAuth, UsersController.list);
router.get('/users/:page?', auth.ensureAuth, UsersController.loginUser);
router.get('/user/search/:idUser', auth.ensureAuth, UsersController.search);
router.post('/user/save/', auth.ensureAuth, UsersController.save);
router.post('/user/login/', auth.ensureAuth, UsersController.login);
router.put('/user/update/:idUser', auth.ensureAuth, UsersController.update);
router.post('/user/upload/:idUser', [auth.ensureAuth, uploadImage], UsersController.upload);
router.get('/user/getImage/:imageFile', UsersController.getImageFile);

module.exports = router;