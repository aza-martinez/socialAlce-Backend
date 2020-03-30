'use strict'
let express = require('express');
let ComplaintsController = require('../Controllers/complaints');
let router = express.Router();
let auth = require('../Middlewares/auth');
let multipart = require('connect-multiparty');
let uploadImage = multipart({uploadDir: './uploads/complaints'});

router.get('/complaints/list/', auth.ensureAuth, ComplaintsController.list);
router.post('/complaint/save/', [auth.ensureAuth, uploadImage], ComplaintsController.save);

//router.get('/suggestions/search/:idUser', auth.ensureAuth, SuggestionsController.search);
//router.put('/user/update/:idUser', auth.ensureAuth, SuggestionsController.update);
//router.post('/suggestions/upload/:idUser', [auth.ensureAuth, uploadImage], SuggestionsController.upload);
//router.get('/suggestions/getImage/:imageFile', SuggestionsController.getImageFile);

module.exports = router;