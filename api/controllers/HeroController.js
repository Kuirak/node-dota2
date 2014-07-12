/**
 * HeroController
 *
 * @description :: Server-side logic for managing heroes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    all:function(req,res){
        Hero.find().populate('roleweight').sort('name').then(function(heroes){
            res.view('heroes_items',{items:heroes});
        }).fail(res.serverError);
    }
};

