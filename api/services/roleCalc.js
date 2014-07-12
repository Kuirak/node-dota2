'use strict';
/**
 * Created by Jonas Kugelmann on 12.07.2014.
 */
var q=require('async-q');
module.exports.calculateRoleWeight =calculateRoleWeight;
function calculateRoleWeight(playerdetail){
    return Roleweight.findOne(playerdetail.hero.roleweight)
        .then(function(weight){
            playerdetail.role={};
            //Berechnung der Heldengewichtung fur jede Rolle
            _.forOwn(weight,function(value,key){
                if(!isNaN(value) && !(value instanceof Date)){

                    playerdetail.role[key]={key:key,value: value*5000};
                }
            });
            playerdetail.hero.roleweight=weight;
            //Berechnung der Gewichtung jedes Gegenstands
            return q.map(playerdetail.items,function(item){
                if(!item.roleweight){
                    return item;
                }
                return Roleweight.findOne(item.roleweight)
                    .then(function(weight ){
                        // für jede Rolle
                        _.forOwn(weight,function(value,key){
                            if(!isNaN(value) && !(value instanceof Date)){
                                playerdetail.role[key].value+= value*item.cost;
                            }
                        });
                        item.roleweight =weight;
                        return item;
                    })
            });
        }).then(function(items){
            playerdetail.items =items;
            return playerdetail;
        });
}
