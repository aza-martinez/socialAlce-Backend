'use strict'
let express = require('express');
let SuggestionsController = require('../Controllers/suggestions');
let router = express.Router();
let auth = require('../Middlewares/auth');
let multipart = require('connect-multiparty');
let uploadImage = multipart({uploadDir: './uploads/suggestions'});

router.get('/suggestions/list/', auth.ensureAuth, SuggestionsController.list);
router.post('/suggestion/save/', [auth.ensureAuth, uploadImage], SuggestionsController.save);

//router.get('/suggestions/search/:idUser', auth.ensureAuth, SuggestionsController.search);
//router.put('/user/update/:idUser', auth.ensureAuth, SuggestionsController.update);
//router.post('/suggestions/upload/:idUser', [auth.ensureAuth, uploadImage], SuggestionsController.upload);
//router.get('/suggestions/getImage/:imageFile', SuggestionsController.getImageFile);

module.exports = router;