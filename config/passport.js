var passport = require('passport')
    ,SteamStrategy = require('passport-steam').Strategy
    ,url = require('url')
    ,steam=require('steam-web')
    ,steamApi = new steam({apiKey:'447623429FF93527982CCAA65604BC41'});

var baseUrl = require('./local').baseUrl;

    passport.use(new SteamStrategy(
        {
            returnURL: url.resolve(baseUrl,'auth/steam/callback'),
            realm:baseUrl
        },
        function(identifier,profile,done){
            User.findOne({ identifier:identifier })
                .then(function ( user) {

                    if (!user) {
                        var steam_id = identifier.slice(_.lastIndexOf(identifier,'/')+1);
                        steamApi.getPlayerSummaries({
                            steamids:[steam_id],
                            callback:function(err,data){
                                if(err)return done(err);
                                if(data.response.players.length <=0){
                                    return done(new Error("No Player Data found for steam id"))
                                }
                                var player =data.response.players[0];
                                var userData={
                                    identifier:identifier,
                                    username : player.personaname,
                                    steam_id : player.steamid,
                                    avatar :player.avatar,
                                    avatarmedium :player.avatarmedium,
                                    avatarfull :player.avatarfull
                                };
                                User.create(userData).then(function(user){
                                    done(null,user);
                                }).fail(function(err){});
                            }
                        })
                    }else{
                        return done(null, user);
                    }

                }).fail(done)
        }));



module.exports = {
    express: {
        customMiddleware: function (app) {
            app.use(passport.initialize());
            app.use(passport.session());
        }
    }
};