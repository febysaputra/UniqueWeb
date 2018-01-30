var express = require('express'),
    auth = require('../controllers/authentication.controller'),
    router = express.Router();

//routing auth
router.get('/getuserinfo', function(req, res, next){
    console.log('masuk router')
    auth.getUserInfo(req, res);
});


router.post('/login', function(req, res, next){
    console.log('masuk router')
    auth.login(req.body, res);
});

router.post('/addadmin', function(req, res, next){
    console.log('masuk router')
    auth.addAdmin(req, res);
});

module.exports = router;
