var sequelize = require('./../dbconnection');
var siswa = sequelize.import('siswa.model.js');

module.exports = function(sequelize, DataType){
	return sequelize.define('prestasis',{
        id_prestasi: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_siswa : {
            type : DataType.INTEGER,
            references : {
                model: siswa,
                key : 'id_siswa'
            }
        },
        nama_lomba : DataType.STRING,
        tingkat : DataType.STRING,
        juara : DataType.INTEGER
    },{
		timestamps: false
    });
}