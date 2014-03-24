/**
 * Hero.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        image:'string',
        id:{type:'integer',unique:true,primaryKey:true},
        displayname:'string',
        name:{type:'string',unique:true}

	},
    beforeCreate: function(values,done){
      values.image=  "http://cdn.dota2.com/apps/dota2/images/heroes/"+ values.name.slice("npc_dota_hero_".length) +"_lg.png";
      done();
    }


};
