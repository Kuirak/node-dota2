/**
 * MatchController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var big = require('big-integer')
    ,q=require('async-q');



module.exports = {
    details:function(req,res){
        var match_id=parseInt(req.params.match_id);
        Match.findOne({match_id:match_id})
            .populate('players')
            .populate('details')
            .populate('playerdetails')
            .then(function(match){
               return Matchdetails.findOne({match: match.id})
                    .then(function(details){
                       if(!details){
                           throw Error("No Matchdetails");
                       }
                      return  Matchplayerdetails.find({match:match.id})
                            .populate('player')
                            .populate('hero')
                            .populate('items').then(function(playerdetails){
                              return q.map(playerdetails,roleCalc.calculateRoleWeight)
                          }).then(function(playerdetails){
                              res.view({details:details,playerdetails:playerdetails,match:match,moment:require('moment')});
                          });
                });


            }).fail(res.serverError);
    },

    heroes:function(req,res){
       Hero.find().sort('name').then(function(heroes){res.view({heroes:heroes});}).fail(res.serverError);
    },
    personalHistory: function(req,res){
        var steam_id = req.user.player.steam_id;
        var page =parseInt(req.param('page')) ||0;
        var limit= 9;
        Player.findOne({steam_id:steam_id}).populate('matches',{skip:page*limit,limit:limit})
            .then(function(player){
                res.view("match/history", {page:page,matches: player.matches,moment:require('moment')});
            }).fail(res.serverError);
    }
};