/**
 * Hero.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        image:'string',
        imagemedium:'string',
        imagevert:'string',
        imagefull:'string',
        hero_id:{type:'integer',unique:true},
        displayname:'string',
        name:{type:'string',unique:true},
        roleweight:{model:'roleweight'},
        source:'json'
	},
    //fügt bilder urls hinzu
    beforeCreate: function (values, done) {
        var baseUrl = "http://cdn.dota2.com/apps/dota2/images/heroes/";
        values.imagefull = baseUrl + values.name.slice("npc_dota_hero_".length) + "_full.png";
        values.imagefull = baseUrl + values.name.slice("npc_dota_hero_".length) + "_vert.jpg";
        values.imagemedium = baseUrl + values.name.slice("npc_dota_hero_".length) + "_lg.png";
        values.image = baseUrl + values.name.slice("npc_dota_hero_".length) + "_sb.png";
        done();
    }


};
