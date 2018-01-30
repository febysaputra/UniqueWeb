var express = require('express'),
    sequelize = require('../dbconnection');

var siswa = sequelize.import('./../models/siswa.model');
var program_keahlian = sequelize.import('./../models/program_keahlian.model');
var orangtua_siswa = sequelize.import('./../models/orangtua_siswa.model');
var auth = require('./authentication.controller');

siswa.belongsTo(program_keahlian, {foreignKey: 'fk_id_program_keahlian'})
orangtua_siswa.belongsTo(siswa, {foreignKey: 'fk_id_siswa'})


class Siswa{
    constructor(){}

    getAllCalonSiswa(req, res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            return siswa.findAll({
                include: [{
                    model: program_keahlian
                }],
                where: { status : 0}
                }).then(function(data){
                    res.status(200).json({status: true, message: "success", data: data});
                }).catch(function(err){
                    res.status(500).json({status: false, message: "an error occured", err: err})
                })
        } else{
            res.status(401).json({status:false, message:"Authentication failed"});
        }
    }

    getAllSiswa(req, res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            return siswa.findAll({
                include:[{
                    model: program_keahlian
                }],
                where: { status : 1}
                }).then(function(data){
                    res.status(200).json({status: true, message: "success", data: data});
                }).catch(function(err){
                    res.status(500).json({status: false, message: "an error occured", err: err})
                })
        } else{
            res.status(401).json({status:false, message:"Authentication failed"});
        }
    }

    getDetailSiswa(req, res){ //id siswa
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            return siswa.findOne({
                include: [{
                    model: program_keahlian
                }],
                where:{
                    id_siswa: req.query.id_siswa
                }
            }).then(function(data){
                    res.status(200).json({status: true, message: "success", data: data});
                }).catch(function(err){
                    res.status(500).json({status: false, message: "an error occured", err: err})
                })
        } else{
            res.status(401).json({status:false, message:"Authentication failed"});
        }
    }

    addSiswa(body, res){

    siswa.create({
        nama_lengkap : body.nama_lengkap,
        jenis_kelamin : body.jenis_kelamin,
        asal_sekolah : body.asal_sekolah,
        nisn : body.nisn,
        nik : body.nik,
        tempat_lahir : body.tempat_lahir,
        tanggal_lahir : body.tanggal_lahir,
        agama: body.agama,
        kewarganegaraan : body.kewarganegaraan,
        nama_negara : body.nama_negara,
        kebutuhan_khusus : body.kebutuhan_khusus,
        alamat_rumah: body.alamat_rumah,
        no_telepon : body.no_telepon,
        email : body.email,
        tentang_smk_master : body.tentang_smk_master,
        fk_id_program_keahlian : body.fk_id_program_keahlian,
        status : body.status
    })
    .then((data)=>{
        res.status(201).json({status: true, message: "success"})
    })
    .catch((err) =>{
        res.send(err)
    })
       
    }

    updateStatusSiswa(req, res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            siswa.update({
                status : req.body.status
            },
            {
                where : { id_siswa : req.query.id_siswa }
            })
            .then(()=>{
                res.status(200).json({status:true, message: "siswa updated"});
            })
            .catch((err)=>{
                res.status(500).json({status:false, message: "siswa not updated"});
            })
        } else {
            res.status(401).json({status:false, message:"Authentication failed"});
        }
    }

    deleteSiswa(req,res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            siswa.destroy({
                where : {
                    id_siswa : req.body.id_siswa
                }
            })
            .then(()=>{
                res.status(200).json({status:true, message: "siswa deleted"});
            })
            .catch((err)=>{
                res.status(500).json({status:false, message: "siswa not deleted"});
            })
        } else {
            res.status(401).json({status:false, message:"Authentication failed"});
        }
    }
    
}

module.exports = new Siswa;