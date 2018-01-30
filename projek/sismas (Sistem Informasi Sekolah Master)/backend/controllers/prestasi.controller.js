var express = require('express'),
    sequelize = require('../dbconnection');

var prestasi = sequelize.import('./../models/prestasi.model');
var auth = require('./authentication.controller');

class Prestasi{
    constructor(){}

    getAllPrestasiSiswa(req, res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            return prestasi.findAll({
                where: {id_siswa : req.query.id_siswa}
            }).then(function(data){
                    res.status(200).json({status: true, message: "success", data: data});
                }).catch(function(err){
                    res.status(500).json({status: false, message: "an error occured", err: err})
                })
        } else{
            res.status(401).json({status:false, message:"Authentication failed"});
        }
    }

    getAllPrestasi(req, res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            return prestasi.findAll().then(function(data){
                    res.status(200).json({status: true, message: "success", data: data});
                }).catch(function(err){
                    res.status(500).json({status: false, message: "an error occured", err: err})
                })
        } else{
            res.status(401).json({status:false, message:"Authentication failed"});
        }
    }

    getDetailPrestasi(req, res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            return prestasi.findById(req.query.id_prestasi).then(function(data){ //id prestasi
                    res.status(200).json({status: true, message: "success", data: data});
                }).catch(function(err){
                    res.status(500).json({status: false, message: "an error occured", err: err})
                })
        } else{
            res.status(401).json({status:false, message:"Authentication failed"});
        }        
    }

    addPrestasi(req, res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){ 
            prestasi.create({
                id_siswa: req.body.id_siswa,
                nama_lomba : req.body.nama_lomba,
                tingkat : req.body.tingkat,
                juara : req.body.juara
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

module.exports = new Prestasi;