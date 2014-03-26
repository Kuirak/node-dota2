var fs =require('fs')
    ,vdf =require('vdf')
    ,path =require('path')
    ,Csv = require('awklib')
/**
 * ItemController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	all:function(req,res){
        Item.find().populate('roleweight').sort('name').then(function(items){
            res.view({items:items});
        }).fail(res.serverError);
    }

};


