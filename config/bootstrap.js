var passport = require('passport')
    ,SteamStrategy = require('passport-steam').Strategy
    ,url = require('url')
    ,fs =require('fs')
    ,vdf =require('vdf')
    ,path =require('path')
    ,Csv = require('awklib')
    ,Q=require('q')
    ,q=require('async-q');

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
    var promises =[];
    promises.push(setupHeroes().then(function(heroes){
        return addItemWeight(heroes,true);
    }));
    promises.push(setupItems().then(addItemWeight));
    promises.push(Player.findOrCreate({steam_id:"76561202255233023"},{steam_id:"76561202255233023"}));
    Q.all(promises).then(function(){cb();}).fail(cb);


    // It's very important to trigger this callack method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

};

function setupHeroes(){
    var deferred = Q.defer();
    var dazzle =require("dazzle");
    var dota2Api = new dazzle(require('./local').steam.apiKey);
        dota2Api.getHeroes(function(err,response){
            if(err)return deferred.reject(err);
            var promises =[];
            _.each(response.heroes,function(hero){
               promises.push( Hero.findOrCreate({hero_id: hero.id},{hero_id: hero.id,displayname:hero.localized_name,name:hero.name})
                    .then(function(hero){return hero;}));
            });
            Q.all(promises).then(deferred.resolve).fail(deferred.reject);
        });
    return deferred.promise;

}


function setupItems(){
    var deferred = Q.defer();
    var itemsPath = path.join(__dirname, "items.txt");
    fs.readFile(itemsPath, {encoding: 'utf8'}, function (err, data) {
        if (err) {
            deferred.reject(err);
            return;
        }
        var items = vdf.parse(data);
        var itemDatas=[];
        _.forIn(items.DOTAAbilities, function (item, name) {
            if (name.indexOf("item_") !== 0) {
                return;
            }
            if(_.contains(name,"recipe")){
                item.ItemAliases = name.slice("item_".length).replace(/_/g, ' ');
            }
            if(!item.ItemAliases ||parseInt(item.ItemCost) ===0){
                return;
            }
            itemDatas.push( {
                item_id: item.ID.toString(),
                name: name,
                cost: item.ItemCost,
                displayname: item.ItemAliases
            });
        });


        Q.all(q.map(itemDatas,function(itemData){
                return Item.findOrCreate({item_id: itemData.item_id}, itemData);
            })).then(deferred.resolve);

    });
    return deferred.promise;
}

function addItemWeight(items ,heroes){
        var deferred = Q.defer();
        var itemsCsvPath;
        if(heroes){
            itemsCsvPath = path.join(__dirname,'heroes.csv');
        }else{
            itemsCsvPath=path.join(__dirname,'items.csv');
        }
        var csvOptions ={
            files:[itemsCsvPath],
            columns:['name','support','pusher','carry','durable','initiator','escaper','disabler','lane_support','nuker','jungler','roamer','ganker'],
            header:true,
            delimiter:';'
        };
        var csvParser =new Csv(csvOptions);
        var promises =[];
        csvParser.on('line',function(obj){
          var item= _.find(items,function(item){return item.name ===obj.crow.name});
            var current =obj.crow;
            if(item){
                _.forOwn(current,function(value,key){
                    if(_.contains(value,'\r')){
                        current[key] =value.replace(/\r/g,'');
                        value = value.replace(/\r/g,'')
                    }
                    if(value.length <=0){
                        current[key] =0
                    }else if(key !=='name'){
                        current[key] =parseInt(current[key]);
                    }
                    if(key !=='name'&& isNaN(current[key])){
                        return;
                    }
                });
               promises.push(
                   Roleweight.findOne({name:current.name})
                   .then(function(weight){
                       if(weight){
                           return Roleweight.update({id:weight.id},current);
                       }else{
                            return Roleweight.create(current);
                       }
                   }).then(function(weight){
                       if(!weight){
                           throw new Error("No Roleweight found or created");
                       }
                       if(heroes){
                           return Hero.update({id:item.id},{roleweight:weight.id})
                       }else {
                           return Item.update({id: item.id}, {roleweight: weight.id});
                       }
                   }).then(function(item){

                        return item;
                   }));
            }else{
                throw new Error("Item not found " + obj.crow.name);
            }
        });
        csvParser.on("end",function(obj){
            Q.all(promises).then(deferred.resolve).fail(deferred.reject);
        });
        csvParser.process();
    return deferred.promise;
}

function setupPassport() {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findOne(id).populate('player').done(function (err, user) {
            done(err, user);
            if(err){
                return
            }
            dota2Api.populateMatchHistory({account_id:user.player.steam_id}).fail(console.error);
        });
    });

    var baseUrl = sails.config.baseUrl;

    passport.use(new SteamStrategy(
        {
            returnURL: url.resolve(baseUrl, 'auth/steam/callback'),
            realm: baseUrl
        },
        function (identifier, profile, done) {
            User.findOne({ identifier: identifier })
                .then(function (user) {

                    if (!user) {
                       return User.create({identifier:identifier}).then(function (usr) {
                            done(null, usr);
                        });

                    } else {
                        return done(null, user);
                    }

                }).fail(done);

        }))
}