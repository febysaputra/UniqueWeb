var express = require('express'),
    siswa = require('../controllers/siswa.controller'),
    router = express.Router();

//routing auth
router.get('/allcalonsiswa', function(req, res, next){
    console.log('masuk router')
    siswa.getAllCalonSiswa(req, res);
});

router.get('/allsiswa', function(req, res, next){
    console.log('masuk router')
    siswa.getAllSiswa(req, res);
});

router.get('/detailsiswa', function(req, res, next){
    console.log('masuk router')
    siswa.getDetailSiswa(req, res); // id siswa
});

router.post('/addsiswa', function(req, res, next){
    console.log('masuk router')
    siswa.addSiswa(req.body, res);
});

router.post('/deletesiswa', function(req, res, next){
    console.log('masuk router')
    siswa.deleteSiswa(req, res);
});

router.put('/updatestatussiswa', function(req, res, next){
    console.log('masuk router')
    siswa.updateStatusSiswa(req, res);
});

module.exports = router;
