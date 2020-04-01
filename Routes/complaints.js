'use strict'
let express = require('express');
let ComplaintsController = require('../Controllers/complaints');
let router = express.Router();
let auth = require('../Middlewares/auth');
let multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

router.get('/complaints/list/', auth.ensureAuth, ComplaintsController.list);
router.post('/complaint/save/', [auth.ensureAuth, multipartMiddleware], ComplaintsController.save);
router.put('/complaint/update/:idComplaint', auth.ensureAuth, ComplaintsController.update);

module.exports = router;