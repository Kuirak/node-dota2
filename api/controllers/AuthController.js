/**
 * Created by Drako on 19.03.14.
 */
var passport = require('passport');

var AuthController ={
    logout: function(req,res){
        req.logout();
        res.redirect('/');
    },
    process:function(req,res){
        passport.authenticate('steam')(req,res)
    },
    callback:function(req,res){
        passport.authenticate('steam',function(err,user){
            if(err){return res.serverError("Can not login user");}
            req.login(user,function(err){
                if(err){return res.serverError("Can not login user");}
                res.redirect("/");
            });

        })(req,res)
    }
};

module.exports = AuthController;