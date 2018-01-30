var sequelize = require('./../dbconnection');
var program_keahlian = sequelize.import('./../models/program_keahlian.model');
program_keahlian.sync()