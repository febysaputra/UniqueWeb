var express = require('express'),
    prestasi = require('../controllers/prestasi.controller'),
    router = express.Router();

//routing auth
router.get('/allprestasisiswa', function(req, res, next){
    console.log('masuk router')
    prestasi.getAllPrestasiSiswa(req, res);
});

router.get('/allprestasi', function(req, res, next){
    console.log('masuk router')
    prestasi.getAllPrestasi(req, res);
});

router.get('/detailprestasi', function(req, res, next){
    console.log('masuk router')
    prestasi.getDetailPrestasi(req, res); // id prestasi
});

router.post('/addprestasi', function(req, res, next){
    console.log('masuk router')
    prestasi.addPrestasi(req, res);
});

module.exports = router;
