'use strict'
let express = require('express');
let SuggestionsController = require('../Controllers/suggestions');
let router = express.Router();
let auth = require('../Middlewares/auth');
let multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

router.get('/suggestions/list/', auth.ensureAuth, SuggestionsController.list);
router.post('/suggestion/save/', [auth.ensureAuth, multipartMiddleware], SuggestionsController.save);
router.put('/suggestion/update/:idSuggestion', auth.ensureAuth, SuggestionsController.update);

module.exports = router;