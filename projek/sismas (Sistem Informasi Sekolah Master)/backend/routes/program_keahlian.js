var express = require('express'),
    program_keahlian = require('../controllers/program_keahlian.controller'),
    router = express.Router();

//routing auth
router.get('/allprogramkeahlian', function(req, res, next){
    console.log('masuk router')
    program_keahlian.getAllProgramKeahlian(req, res);
});

router.get('/detailprogramkeahlian', function(req, res, next){
    console.log('masuk router')
    program_keahlian.getDetailProgramKeahlian(req, res); // id program keahlian
});

router.post('/addprogramkeahlian', function(req, res, next){
    console.log('masuk router')
    program_keahlian.addProgramKeahlian(req, res);
});

module.exports = router;
