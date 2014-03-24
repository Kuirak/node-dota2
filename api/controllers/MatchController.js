/**
 * MatchController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */




module.exports = {
	getMatch: function(req,res){
        var match_id=req.params.match_id;
        dota2Api().getMatchDetails(match_id,function(err,response){
            if(err) res.send(500);
            res.view({match:response})
        })
    },
    history:function(req,res){
        dota2Api().getMatchHistory(function(err,response){
            if(err) res.send(500);
            //lobby_type  7 = ranked match
            var matches = _.filter(response.matches,function(match){return match.lobby_type ===(0 || 7)});
            res.view({matches:matches});
        })
    },
    heroes:function(req,res){
       Hero.find().then(function(heroes){res.view({heroes:heroes});}).fail(res.serverError);
    },
    personalHistory: function (req, res) {
        var account_id = req.user.player.steam_id;
        dota2Api().getMatchHistory({account_id: account_id}, function (err, response) {
            if (err) res.send(500);
            res.view("match/history", {matches: response.matches});
        })
    }
};
