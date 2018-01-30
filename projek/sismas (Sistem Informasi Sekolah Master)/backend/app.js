var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var fetch = require('node-fetch');

//routes
var siswa = require('./routes/siswa');
var orangtua_siswa = require('./routes/orangtua_siswa');
var prestasi = require('./routes/prestasi');
var program_keahlian = require('./routes/program_keahlian');
var auth = require('./routes/auth');

var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname+'/dist'));

app.get('/', function(req, res){
    res.send('Hello World');
});

//using router
app.use('/auth', auth);
app.use('/siswa', siswa);
app.use('/orangtuasiswa', orangtua_siswa);
app.use('/prestasi', prestasi);
app.use('/programkeahlian', program_keahlian);

app.use('*', function(req, res, next){
  res.json({status:false, message:'non API implemented'})
})

module.exports = app;