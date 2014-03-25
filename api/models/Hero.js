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
        hero_id:{type:'string',unique:true},
        displayname:'string',
        name:{type:'string',unique:true},
        source:'json'
	},
    beforeCreate: function (values, done) {
        var baseUrl = "http://cdn.dota2.com/apps/dota2/images/heroes/";
        values.imagefull = baseUrl + values.name.slice("npc_dota_hero_".length) + "_full.png";
        values.imagefull = baseUrl + values.name.slice("npc_dota_hero_".length) + "_vert.jpg";
        values.imagemedium = baseUrl + values.name.slice("npc_dota_hero_".length) + "_lg.png";
        values.image = baseUrl + values.name.slice("npc_dota_hero_".length) + "_sb.png";
        done();
    }


};
