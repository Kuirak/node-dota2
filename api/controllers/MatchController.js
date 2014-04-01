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
            .exec(function(err,match){
               if(err){
                   res.serverError(err);
                   return
               }
               res.view({match:match});
            });
    },
    history:function(req,res){
        dota2Api().getMatchHistory(function(err,response){
            if(err) res.send(500);
            //lobby_type  7 = ranked match
            var matches = _.filter(response.matches,function(match){return match.lobby_type ===(0 || 7)});
            res.view({matches:matches});
        })
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

function bla(req, res) {
    var account_id = req.user.player.steam_id;
    dota2Api().getMatchHistory({account_id: account_id, matches_requested: 100}, function (err, response) {
        if (err) res.send(500);
        var matches = [];
        async.each(response.matches, function (match, done) {
            var match_id =match.match_id;
            Match.findOne().where({match_id: match_id}).then(function (matchDb) {
                if (matchDb) {
                    matches.push(matchDb);
                    done();
                    return
                }
                var matchData = {
                    dire_players: [],
                    radiant_players: [],
                    dire_heroes: [],
                    radiant_heroes: [],
                    players: []
                };
                async.eachSeries(match.players, function (player, done) {
                    var steam_id = big(player.account_id).add("76561197960265728").toString();
                    Player.findOrCreate({steam_id: steam_id}, {steam_id: steam_id}).then(function (playerDb) {
                        var promise;
                        if (player.player_slot < 5 || (player.player_slot > 127 && player.player_slot < 133))
                            matchData.players.push(playerDb.id);
                        if (player.player_slot < 5) {
                            //radiant
                            matchData.radiant_players.push(playerDb.id);
                            promise = Hero.findOne({hero_id:player.hero_id.toString()}).then(function(hero){
                                matchData.radiant_heroes.push(hero.id);
                            });
                        } else if (player.player_slot > 127 && player.player_slot < 133) {
                            //dire
                            matchData.dire_players.push(playerDb.id);
                            promise= Hero.findOne({hero_id:player.hero_id.toString()}).then(function(hero){
                                matchData.dire_heroes.push(hero.id);
                            });
                        }
                        return promise.then(done)

                    }).fail(done);

                }, function (err) {
                    if (err) return done(err);
                    Match.create({match_id: match.match_id}).then(function (match) {
                        _.forIn(matchData, function (value, key) {
                            _.each(value, function (player) {
                                match[key].add(player);
                            })
                        });
                        match.save(function (err) {
                            if (err)return done(err);
                            matches.push(match);
                            done();
                        });
                    }).fail(done);
                });
            }).fail(done);
        }, function (err) {
            if (err) return res.serverError(err);
            res.view("match/history", {matches: matches});
        });
    })
}
