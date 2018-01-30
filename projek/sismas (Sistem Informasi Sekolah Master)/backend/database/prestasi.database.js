var sequelize = require('./../dbconnection');
var prestasi = sequelize.import('./../models/prestasi.model');
prestasi.sync()