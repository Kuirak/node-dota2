var dazzle =require("dazzle");
var dota2Api =null;

module.exports = function(){
    if(!dota2Api){
        dota2Api = new dazzle(sails.config.steam.apiKey);
    }
   return dota2Api;
};