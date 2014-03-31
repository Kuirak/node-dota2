var dazzle =require("dazzle")
    ,Q=require('q')
    ,q=require('async-q')
    ,big=require('big-integer')
    ,moment =require('moment');
var instance =null;

module.exports.init = init;

function init(){
    if(!instance){
        instance = new dazzle(sails.config.steam.apiKey);
    }
    return instance;
}
module.exports.populateMatchHistory =populateMatchHistory;
function populateMatchHistory(options){
    //TODO  Base options
    var deferred = Q.defer();
    var dota2Api = init();
    dota2Api.getMatchHistory(options,function(err,response){
        if(err) throw new Error(err);
        if(response.status !== 1){
            throw new Error("Dota2Api: StatusCode " +response.status+" - "+ response.statusDetail);
        }
        var results = {
            total: response.total_results,
            count: response.num_results,
            remaining: response.results_remaining
        };

        var matches = response.matches;
        var promises = q.map(matches,function(match){
            var start_time = moment.unix(match.start_time);

            var matchData={
              match_id:match.match_id,
              match_seq_num:match.match_seq_num,
              lobby_type:match.lobby_type,
              start_time: start_time.toDate()
            };

            return Q.all(q.mapSeries(match.players,function(player){
                var steam_id = big(player.account_id).add("76561197960265728").toString();
                return Player.findOrCreate({steam_id: steam_id}, {steam_id: steam_id});
            })).then(function(players){
                return Match.findOrCreate({match_id:match.match_id},matchData)
                    .populate('players')
                    .populate('details')
                    .populate('playerdetails')
                    .then(function(match){
                        if(match.players.length<=0){
                           _.each(players,function(player){
                                if(!_.find(match.players,{id:player.id})){
                                    match.players.add(player.id);
                                }
                            });
                        }
//                            return Q.ninvoke(match,'save');
                        return [match,players];
                    }).spread(getMatchDetails)
            })

        });

        Q.all(promises).then(deferred.resolve).fail(deferred.reject);
    });
    return deferred.promise;
}

function getMatchDetails(match,players){
    var dota2Api = init();
        if(!match.details){
        var deferred = Q.defer();
        dota2Api.getMatchDetails(match.match_id,function(err,response){
           if(err) {
               deferred.reject(err);
               return;
           };
            deferred.resolve(response);
        });
         return deferred.promise.then(function(response) {
                var details = {
                    match: match.id,
                    radiant_win: response.radiant_win,
                    duration: response.duration,
                    first_blood_time: response.first_blood_time,
                    game_mode: response.game_mode,
                    source: response
                };
                return Matchdetails.create(details).then(function (details) {
                    match.details = details.id;
                    return response
                });
            }).then(function(response){
                q.map(response.players,function(player){
                    if (player.player_slot < 5) {
                        //radiant
                        player.radiant =true;

                    } else if (player.player_slot > 127 && player.player_slot < 133) {
                        //dire
                        player.radiant =false;
                    }

                    var playerdetails={
                        match:match.id,
                        radiant:player.radiant,
                        kills:player.kills,
                        deaths:player.deaths,
                        assists:player.assists,
                        gold:player.gold,
                        last_hits:player.last_hits,
                        denies:player.denies,
                        gpm:player.gold_per_min,
                        xpm:player.xp_per_min,
                        gold_spent:player.gold_spent,
                        hero_damage:player.hero_damage,
                        tower_damage:player.tower_damage,
                        hero_healing:player.hero_healing,
                        level:player.level
                    };
                    var items=[];
                    for (var i = 0; i < 6; i++) {
                        items.push(Item.findOne({item_id:player['item_'+i]}));
                    }
                    return Hero.findOne({hero_id:player.hero_id})
                        .then(function(hero){
                            playerdetails.hero =hero.id;

                            var steam_id = big(player.account_id).add("76561197960265728").toString();
                            var playerDb=_.find(players,{steam_id:steam_id});
                            playerdetails.player =playerDb.id;

                            return Matchplayerdetails.create(playerdetails);
                        }).then(function(playerdetails){
                            return Q.all(items).then(function(items){
                                _.map(items,function(item){
                                    playerdetails.items.add(item.id)
                                });
                                match.playerdetails.add(playerdetails.id);
                                return Q.ninvoke(playerdetails,'save');
                            })

                        });

                }).then(function(){
                    return match;
                })

            }).then(function(match){
                return Q.ninvoke(match, 'save');
            })
    }else {
        return Q.ninvoke(match, 'save');
    }
}

