var express = require('express'),
    orangtua_siswa = require('../controllers/orangtua_siswa.controller'),
    router = express.Router();

//routing auth
router.get('/allorangtuasiswa', function(req, res, next){
    console.log('masuk router')
    orangtua_siswa.getAllOrangtuaSiswa(req, res);
});

router.get('/detailorangtuasiswa', function(req, res, next){
    console.log('masuk router')
    orangtua_siswa.getDetailOrangtuaSiswa(req, res); // id orangtua
});

router.post('/addorangtuasiswa', function(req, res, next){
    console.log('masuk router')
    orangtua_siswa.addOrangtuaSiswa(req, res);
});

module.exports = router;
