var sequelize = require('./../dbconnection');

module.exports = function(sequelize, DataType){
	return sequelize.define('program_keahlians',{
        id_program_keahlian: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nama_program_keahlian: DataType.STRING,
    },{
		timestamps: false
    });
}