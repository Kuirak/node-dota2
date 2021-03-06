var dazzle =require("dazzle")
    ,Q=require('q')
    ,q=require('async-q')
    ,big=require('big-integer')
    ,moment =require('moment');
module.exports.init = init;

function init(){
   return new dazzle(sails.config.steam.apiKey);
}

module.exports.populateMatchHistory =populateMatchHistory;

var running={};

function populateMatchHistory(options){
    //Deferred Object für die Promises
    var deferred = Q.defer();
    //Falls bereits ein Prozess läuft fertig
    if(running[options.account_id]){
        deferred.resolve();
        return deferred.promise;
    }
    running[options.account_id] =true;

    console.info("Getting matches for "+options.account_id );
    //Standardwerte für die options
    options.min_players = options.min_players || 10;
    //Matches werden immer in 100 Paketen abgeholt wenn nicht anderse definiert
    options.matches_requested =options.matches_requested ||100;

    var dota2Api = init();
    //Zugriff auf die WebAPI um die Match History zu holen
    dota2Api.getMatchHistory(options,function(err,response){
        if(err) {
            deferred.reject(err);
            return;
        }
        if(!response){
            deferred.reject(new Error("Dota2Api: No response "));
            return;
        }
        if( response.status !== 1 ){
            deferred.reject(new Error("Dota2Api: StatusCode " +response.status+" - "+ response.statusDetail));
            return;
        }
        var results = {
                total: response.total_results,
                count: response.num_results,
                remaining: response.results_remaining,
                lastMatchId: _.min(response.matches,'match_seq_num').match_id
        };
        console.info("Got "+results.count +" matches for" + options.account_id +
            " with " + results.remaining+" and a total of " +results.total);

        var matches = response.matches;
        //für alle matches:
        var promises = q.map(matches,function(match){
            if(match.lobby_type <0){
                deferred.reject(new Error("Dota2Api: Invalid Lobbytype"));
                return
            }
            //Prüfen ob der Lobby type stimmt damit  keine Bot oder sonstigen Sonderspiele mit reingezählt werden
            if(match.lobby_type >0 && match.lobby_type <5){
                return null;
            }
            //Konvertieren der unix seconds time in moment.js time.
            var start_time = moment.unix(match.start_time);

            var matchData={
              match_id:match.match_id,
              match_seq_num:match.match_seq_num,
              lobby_type:match.lobby_type,
              start_time: start_time.toDate()
            };
            //Reduzieren der player ids  auf unique account_ids da alle die ihr
            //Profil auf privat gestellt haben die selbe account_id haben
            var players = _.uniq(match.players,'account_id');
            return q.map(players,function(player){
                // erstellen oder finden des Playermodells
                var steam_id = big(player.account_id).add("76561197960265728").toString();
                return Player.findOne({steam_id: steam_id}).then(function(player){
                    if(player){
                        return player;
                    }else{
                        return Player.create( {steam_id: steam_id}).fail(function(err){
                            return Player.findOne({steam_id: steam_id})
                        });
                    }
                });
            }).then(function(players){
                //erstellen oder finden des Matches.
                //falls keine Spieler vorhanden sind füge die Spieler hinzu
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
                       return match;
                    });
            }).then(function(match){
                //prüfen ob bereits Matchdetails vorhanden sind
                // wenn ja, dann match speichern
                // ansonsten neue von der dota2api holen
                return Matchdetails.findOne({match:match.id}).then(function(details){
                    if(details){
                        console.info("Had Details "+match.match_id);
                        return Q.ninvoke(match, 'save');
                    }else{
                        return getMatchDetails(match);
                    }
                });
            });
        });

        //Wenn alle Matches fertig sind running auf false und neustarten bis es keine Matches mehr gibt.
        promises.then(function(){
            if(results.remaining >0){
                running[options.account_id]=false;
                options.start_at_match_id =results.lastMatchId;
                return populateMatchHistory(options).then(function(){
                    deferred.resolve();
                })
            }else {
                console.info("got all matches");
                deferred.resolve();
            }
        }).fail(function(err){
            running[options.account_id]=false;
            deferred.reject(err);
        });
    });
    return deferred.promise;
}

var updateCount=0;
//Holt die Matchdetails und speichert diese in die Datenbank oder updated das Match
function getMatchDetails(match){
    if(!match){
        return null;
    }
    var dota2Api = init();
    var deferred = Q.defer();
    dota2Api.getMatchDetails(match.match_id, function (err, response) {
        if (err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(response);
    });
    return deferred.promise
        .then(function (response) {
            var details = {
                match: match.id,
                radiant_win: response.radiant_win,
                duration: response.duration,
                first_blood_time: response.first_blood_time,
                game_mode: response.game_mode,
                source: response
            };
            return Matchdetails.create(details)
                .then(function (details) {
                    match.details = details.id;
                    return response });
        }).then(function (response) {
            return q.map(response.players, function (player) {
                if (player.player_slot < 5) {
                    //radiant
                    player.radiant = true;
                } else if (player.player_slot > 127 && player.player_slot < 133) {
                    //dire
                    player.radiant = false;
                }
                var playerdetail = {
                    match: match.id,
                    radiant: player.radiant,
                    kills: player.kills,
                    deaths: player.deaths,
                    assists: player.assists,
                    gold: player.gold,
                    last_hits: player.last_hits,
                    denies: player.denies,
                    gpm: player.gold_per_min,
                    xpm: player.xp_per_min,
                    gold_spent: player.gold_spent,
                    hero_damage: player.hero_damage,
                    tower_damage: player.tower_damage,
                    hero_healing: player.hero_healing,
                    level: player.level
                };
                //Get items id
                var items = [];
                for (var i = 0; i < 6; i++) {
                    items.push(Item.findOne({item_id: player['item_' + i].toString()}));
                }
                //Get Player id
                return Matchplayerdetails.create(playerdetail).then(function(playerdetail){
                        var steam_id = big(player.account_id).add("76561197960265728").toString();
                        return Player.findOne({steam_id: steam_id}).then(function (playerDb) { //Create playerdetails
                            if(!playerDb){
                                console.log("No player found");
                            }
                            playerdetail.player = playerDb.id;
                            return playerdetail;
                        })
                    }).then(function (playerdetail) {
                                //Get Hero id
                            return  Hero.findOne({hero_id: player.hero_id})
                                    .then(function (hero) {
                                        playerdetail.hero = hero.id;
                                        return playerdetail;
                                    });
                    }).then(function(playerdetail){//get Items
                                if (!playerdetail) {
                                    throw new Error("Dota2Api: playerdetails of " + match.match_id +
                                        " is " + playerdetail);
                                }
                                return Q.all(items)
                                    .then(function (items) { //Set items & save
                                        _.map(items, function (item) {
                                            if (!item)return;
                                            playerdetail.items.add(item.id)
                                        });
                                        match.playerdetails.add(playerdetail.id);
                                        return Q.ninvoke(playerdetail, 'save');
                                    });
                            });

            });
    }).then(function () {
        return Q.ninvoke(match, 'save').then(function () {
            updateCount++;
            console.info(updateCount + ": Updated match " + match.match_id+ " / " + match.match_seq_num);
            return match;
        });
    })

}

