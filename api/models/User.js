/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        identifier:{type:'string',unique:true, required:true},
        player:{model:"Player"}

	},
    beforeCreate: function (values, done) {
        var steam_id = values.identifier.slice(_.lastIndexOf(values.identifier, '/') + 1);
        Player.create({steam_id:steam_id}).then(function(player){
            values.player = player.id;
            done();
        }).fail(done);
    }

};
