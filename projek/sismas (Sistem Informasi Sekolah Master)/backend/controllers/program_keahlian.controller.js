var express = require('express'),
    sequelize = require('../dbconnection');

var program_keahlian = sequelize.import('./../models/program_keahlian.model');
var auth = require('./authentication.controller');

class ProgramKeahlian{
    constructor(){}

    getAllProgramKeahlian(req, res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            return program_keahlian.findAll().then(function(data){
                    res.status(200).json({status: true, message: "success", data: data});
                }).catch(function(err){
                    res.status(500).json({status: false, message: "an error occured", err: err})
                })
        } else{
            res.status(401).json({status:false, message:"Authentication failed"});
        }
    }

    getDetailProgramKeahlian(req, res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            return program_keahlian.findById(req.query.id_program_keahlian).then(function(data){ //id program keahlian
                    res.status(200).json({status: true, message: "success", data: data});
                }).catch(function(err){
                    res.status(500).json({status: false, message: "an error occured", err: err})
                })
        } else{
            res.status(401).json({status:false, message:"Authentication failed"});
        }       
    }

    addProgramKeahlian(req, res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            program_keahlian.create({nama_program_keahlian : req.body.nama_program_keahlian})
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

module.exports = new ProgramKeahlian;