var sequelize = require('./../dbconnection');
var orangtua_siswa = sequelize.import('./../models/orangtua_siswa.model');
orangtua_siswa.sync()