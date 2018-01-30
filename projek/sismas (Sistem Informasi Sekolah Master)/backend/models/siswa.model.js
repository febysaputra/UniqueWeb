var sequelize = require('./../dbconnection');
var program_keahlian = sequelize.import('program_keahlian.model.js');

module.exports = function(sequelize, DataType){
	return sequelize.define('siswas',{
        id_siswa: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nama_lengkap : DataType.STRING,
        jenis_kelamin: DataType.INTEGER, // 1 for man, 0 for woman
        asal_sekolah: DataType.STRING,
        nisn : DataType.STRING,
        nik : DataType.STRING,
        tempat_lahir : DataType.STRING,
        tanggal_lahir : DataType.DATE,
        agama : DataType.STRING,
        kewarganegaraan : DataType.STRING,
        nama_negara : DataType.STRING,
        kebutuhan_khusus : DataType.INTEGER, //1 for ya, 0 for tidak
        alamat_rumah: DataType.STRING,
        no_telepon: DataType.STRING,
        email: DataType.STRING,
        tentang_smk_master : DataType.STRING,
        fk_id_program_keahlian : {
            type: DataType.INTEGER,
            references : {
                model: program_keahlian,
                key : 'id_program_keahlian'
            }
        },
        status : DataType.INTEGER  //0 untuk calon, 1 untuk siswa

    },{
		timestamps: false
    });
}