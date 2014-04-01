/**
 * MatchController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var big = require('big-integer');



module.exports = {
	getMatch: function(req,res){
        var match_id=req.params.match_id;
        dota2Api().getMatchDetails(match_id,function(err,response){
            if(err) res.send(500);
            res.view({match:response})
        })
    },
    details:function(req,res){
        var match_id=parseInt(req.params.match_id);
        Match.findOne({match_id:match_id})
            .populate('players')
            .populate('details')
            .populate('playerdetails')
            .then(function(match){
               return Matchdetails.findOne({match: match.id})
                    .then(function(details){
                      return  Matchplayerdetails.find({match:match.id})
                            .populate('player')
                            .populate('hero')
                            .populate('items').then(function(playerdetails){
                              res.view({details:details,playerdetails:playerdetails,match:match,moment:require('moment')});
                          })
                });


            }).fail(res.serverError);
    },

    heroes:function(req,res){
       Hero.find().sort('name').then(function(heroes){res.view({heroes:heroes});}).fail(res.serverError);
    },
    personalHistory: function(req,res){
        var steam_id = req.user.player.steam_id;
        Player.findOne({steam_id:steam_id}).populate('matches')
            .then(function(player){
                res.view("match/history", {matches: player.matches,moment:require('moment')});
            }).fail(res.serverError);
    }
};