/**
 * Item.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        image:'string',
        id: {type: 'integer', unique:true,primaryKey:true},
        displayname:{type:'string'},
        name:{type:'string',unique:true},
        cost:'integer'
	},
    beforeCreate:function(values,next){
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
        if(!values.displayname){
           //next(new Error("Item "+values.name+"displayname is null")) ;
           return;
        }
        next();
    }
};
