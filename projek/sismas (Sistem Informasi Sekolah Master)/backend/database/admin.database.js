var sequelize = require('./../dbconnection');
var admin = sequelize.import('./../models/admin.model');
admin.sync()