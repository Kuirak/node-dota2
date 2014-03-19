var passport = require('passport')
    ,SteamStrategy = require('passport-steam').Strategy
    ,url = require('url')
    ,steam=require('steam-web')
    ,steamApi = new steam({apiKey:'447623429FF93527982CCAA65604BC41'})
    ,fs =require('fs')
    ,vdf =require('vdf')
    ,path =require('path');

/**
 * Bootstrap
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {
    setupPassport();
    setupItems();
    // It's very important to trigger this callack method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};



function setupItems(){
    var itemsPath= path.join(__dirname,"items.txt");
    fs.readFile(itemsPath,{encoding:'utf8'},function(err,data){
        if(err){return console.error("Cannot read items.txt: "+err);}
        var items = vdf.parse(data);

        _.forIn(items.DOTAAbilities,function(item,name){
            if(name.indexOf("item_")!==0){
                return;
            }
            var itemData={
                id :item.ID,
                displayname:item.ItemAliases,
                name:name,
                cost:item.ItemCost,
                image: "http://cdn.dota2.com/apps/dota2/images/items/"+ name.slice("item_".length)+"_lg.png"
            };
            Item.findOne({id:itemData.id})
                .then(function(item){
                if(item){
                 if(item.name !== itemData.name){
                     throw new Error("Items name differs!")
                 }
                }else{
                  return Item.create(itemData);
                }
            }).fail(function(err){
                    console.error("Cannot update Item: " + err)
                })
        })
    })
}

function setupPassport() {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findOne(id).done(function (err, user) {
            done(err, user);
        });
    });

    var baseUrl = require('./local').baseUrl;

    passport.use(new SteamStrategy(
        {
            returnURL: url.resolve(baseUrl, 'auth/steam/callback'),
            realm: baseUrl
        },
        function (identifier, profile, done) {
            User.findOne({ identifier: identifier })
                .then(function (user) {

                    if (!user) {
                        var steam_id = identifier.slice(_.lastIndexOf(identifier, '/') + 1);
                        steamApi.getPlayerSummaries({
                            steamids: [steam_id],
                            callback: function (err, data) {
                                if (err)return done(err);
                                if (data.response.players.length <= 0) {
                                    return done(new Error("No Player Data found for steam id"))
                                }
                                var player = data.response.players[0];
                                var userData = {
                                    identifier: identifier,
                                    username: player.personaname,
                                    steam_id: player.steamid,
                                    avatar: player.avatar,
                                    avatarmedium: player.avatarmedium,
                                    avatarfull: player.avatarfull
                                };
                                User.create(userData).then(function (user) {
                                    done(null, user);
                                }).fail(function (err) {
                                    });
                            }
                        })
                    } else {
                        return done(null, user);
                    }

                }).fail(done)
        }));
}