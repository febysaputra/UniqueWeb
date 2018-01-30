var express = require('express'),
    sequelize = require('../dbconnection');

var orangtua_siswa = sequelize.import('./../models/orangtua_siswa.model');
var auth = require('./authentication.controller');



class OrangtuaSiswa{
    constructor(){}

    getAllOrangtuaSiswa(req, res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            return orangtua_siswa.findAll().then(function(data){
                    res.status(200).json({status: true, message: "success", data: data});
                }).catch(function(err){
                    res.status(500).json({status: false, message: "an error occured", err: err})
                })
        } else{
            res.status(401).json({status:false, message:"Authentication failed"});
        }
    }

    getDetailOrangtuaSiswa(req, res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            return orangtua_siswa.findById(req.query.id_orangtua_siswa).then(function(data){ //id orangtua
                    res.status(200).json({status: true, message: "success", data: data});
                }).catch(function(err){
                    res.status(500).json({status: false, message: "an error occured", err: err})
                })
        } else{
            res.status(401).json({status:false, message:"Authentication failed"});
        }
    }

    addOrangtuaSiswa(req, res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            orangtua_siswa.create({
                nama_lengkap: req.body.nama_orangtua,
                pekerjaan: req.body.pekerjaan,
                alamat_rumah: req.body.alamat_rumah_orangtua,
                no_telepon : req.body.no_telepon_orangtua,
                fk_id_siswa : req.body.fk_id_siswa
            })
            .then(()=>{
                res.status(201).json({status: true, message: "success"})
            })
            .catch((err) =>{
                res.send(err)
            })
        } else{
            res.status(401).json({status:false, message:"Authentication failed"});
        }
    }
}

module.exports = new OrangtuaSiswa;