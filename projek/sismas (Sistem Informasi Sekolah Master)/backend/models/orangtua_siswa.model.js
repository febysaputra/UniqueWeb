var sequelize = require('./../dbconnection');
var siswa = sequelize.import('siswa.model.js');

module.exports = function(sequelize, DataType){
	return sequelize.define('orangtua_siswas',{
        id_orangtua_siswa: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fk_id_siswa: {
            type: DataType.INTEGER,
            references : {
                model: siswa,
                key : 'id_siswa'
            }
        },
        nama_lengkap_orangtua : DataType.STRING,
        pekerjaan_orangtua : DataType.STRING,
        alamat_rumah_orangtua : DataType.STRING,
        no_telepon_orangtua : DataType.STRING
    },{
		timestamps: false
    });
}