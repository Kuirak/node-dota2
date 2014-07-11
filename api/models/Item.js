/**
 * Item.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        image:'string',
        item_id: {type: 'string', unique:true},
        displayname:{type:'string'},
        name:{type:'string',unique:true},
        cost:'integer',
        playerdetails:{collection:'matchplayerdetails',via:'items'},
        roleweight:{model:'roleweight'}
	},
    //fügt bilder urls hinzu
    beforeCreate:function(values,done){
        var base = "http://cdn.dota2.com/apps/dota2/images/items/";
        if(_.contains(values.name,"recipe")){
            values.image = base+ "recipe_lg.png";
            values.displayname = values.name.slice("item_".length).replace(/_/g, ' ');
        }else{
            values.image = base + values.name.slice("item_".length)+"_lg.png";
        }
        if(_.contains(values.displayname,';')){
            var names = values.displayname.split(';');
            values.displayname = _.last(names);
        }

        if(!values.displayname || values.cost ===0){
            console.error("Didn't create: "+values.name);
            return;
        }
        done();
    }
};
