var sequelize = require('./../dbconnection');

module.exports = function(sequelize, DataType){
	return sequelize.define('admins',{
        id_admin: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: DataType.STRING,
        password: DataType.STRING
    },{
		timestamps: false
    });
}