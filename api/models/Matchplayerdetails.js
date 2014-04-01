/**
 * Matchplayerdetails.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        match:{model: 'match'},
        player:{model:'player'},
        items:{collection:'item',via:'playerdetails', dominant:true},
        radiant:'boolean',
        hero:{model:'hero'},
        kills:'integer',
        deaths:'integer',
        assists:'integer',
        gold:'integer',
        last_hits:'integer',
        denies:'integer',
        gpm:'integer',
        xpm:'integer',
        gold_spent:'integer',
        hero_damage:'integer',
        tower_damage:'integer',
        hero_healing:'integer',
        level:'integer'
	}

};
