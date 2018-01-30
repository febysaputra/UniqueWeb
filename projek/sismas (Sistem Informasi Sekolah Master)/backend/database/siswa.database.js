var sequelize = require('./../dbconnection');
var siswa = sequelize.import('./../models/siswa.model');
siswa.sync()