var passport = require('passport')
    ,SteamStrategy = require('passport-steam').Strategy
    ,url = require('url')
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
    Item.destroy().exec(function (err, items) {
        if (err)return console.error("Cannot Clear Items");
        var itemsPath = path.join(__dirname, "items.txt");
        fs.readFile(itemsPath, {encoding: 'utf8'}, function (err, data) {
            if (err) {
                return console.error("Cannot read items.txt: " + err);
            }
            var items = vdf.parse(data);

            _.forIn(items.DOTAAbilities, function (item, name) {
                if (name.indexOf("item_") !== 0) {
                    return;
                }
                var itemData = {
                    id: item.ID,
                    name: name,
                    cost: item.ItemCost,
                    displayname: item.ItemAliases
                };
                Item.findOne({id: itemData.id})
                    .then(function (item) {
                        if (item) {
                            if (item.name !== itemData.name) {
                                throw new Error("Items name differs!")
                            }
                        } else {
                            return Item.create(itemData);
                        }
                    }).fail(function (err) {
                        console.error("Cannot update Item: " + err)
                    });
            });
        });
    });
}

function setupPassport() {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findOne(id).populate('player').done(function (err, user) {
            done(err, user);
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