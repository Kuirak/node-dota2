/**
 * Player.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        username  : { type: 'string'},
        steam_id:{type:'string',unique:true,required:true},
        avatar:'string',
        avatarmedium:'string',
        avatarfull:'string',
        anonymous:'bool',
        matches:{collection:'match',via:'players'},

	},
    beforeCreate: function(values,done){
        steamApi().getPlayerSummaries({
            steamids: [values.steam_id],
            callback: function (err, data) {
                if (err)return done(err);
                if (data.response.players.length <= 0) {
                    values.anonymous =true;
                    done();
                    return
                }
                var player = data.response.players[0];
                _.merge(values, {
                    username: player.personaname,
                    steam_id: player.steamid,
                    avatar: player.avatar,
                    avatarmedium: player.avatarmedium,
                    avatarfull: player.avatarfull,
                    anonymous :parseInt(player.communityvisibilitystate) === 1
                });
                done();
            }
        })
    }

};
