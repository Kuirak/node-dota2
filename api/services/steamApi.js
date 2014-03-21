var steam =require("steam-web");
var steamApi =null;

module.exports = function(){
    if(!steamApi){
        steamApi=new steam(sails.config.steam);
    }
    return steamApi;
};