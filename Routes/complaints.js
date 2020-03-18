'use strict'
let express = require('express');
let ComplaintsController = require('../Controllers/complaints');
let router = express.Router();
let auth = require('../Middlewares/auth');
let multipart = require('connect-multiparty');
let uploadImage = multipart({uploadDir: './uploads/complaints'});

router.post('/complaint/save/', auth.ensureAuth, ComplaintsController.save);

module.exports = router;