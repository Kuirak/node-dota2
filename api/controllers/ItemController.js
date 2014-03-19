/**
 * ItemController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	all:function(req,res){
        Item.find().then(function(items){
            res.view({items:items});
        }).fail(res.serverError);

    }
};
