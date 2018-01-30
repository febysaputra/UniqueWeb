var express = require('express'),
	sequelize = require('../dbconnection'),
    jwt = require('jsonwebtoken'),
    fetch = require('node-fetch'),    
    crypto = require('crypto');

var admin = sequelize.import('./../models/admin.model');

class Authentication{

    constructor(){}

    tokenCheck(token){
        try{
            var decoded = jwt.verify(token, '1n1k3yt3rb41k');
            return decoded;
        }catch(err){
            return null;
        }
    }

    getUserInfo(req, res){
        var jwt_decoded = this.tokenCheck(req.headers['authorization']);
        if(!jwt_decoded){
            res.status(200).json({status: false, message: "token error"});
        }else{
            let data = {};
            data['username'] = jwt_decoded.username;
            res.status(200).json({status: true, message: "token valid", data: data});
        }

    }

    login(body, res){
        let pass = crypto.createHash('sha256').update(body.password).digest('hex')
        admin.findOne({
            where: {
                username: body.username,
                password: pass
            }
        }).then(function(admin){
            var login_time = Math.floor(Date.now()/1000);
            var jwtData = {
                nama_user:admin.username,
                iat: login_time,
                exp: login_time + 3600 // expired in 1 hour
            };
            var token = jwt.sign(jwtData, '1n1k3yt3rb41k');
            if(admin){
                res.status(200).json({status: true, message: 'login success', data: token});
            }
        }).catch(function(err){
/*            console.log(crypto.createHash('sha256').update(body.password).digest('hex'))*/
            res.status(500).json({status: false, message: 'wrong username or password'});
        })
        
    }

      addAdmin(req, res){
        var info = auth.tokenCheck(req.headers['authorization'])

        if(!info){
            admin.create({
                username: req.body.username,
                password: crypto.createHash('sha256').update(req.body.password).digest('hex')
            })
            .then((data)=>{
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

module.exports = new Authentication;