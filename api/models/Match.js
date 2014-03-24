/**
 * Match.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        match_id:{type: 'string',unique:true,required:true},
        players:{collection:'player',via:'matches',dominant:true},
        radiant_players:{collection:'player',via: 'radiant_matches',dominant: true},
        dire_players:{collection: 'player',via: 'dire_matches',dominant: true},
        radiant_heroes:{collection: 'hero',via: 'radiant_matches',dominant: true},
        dire_heroes:{collection: 'hero',via: 'dire_matches',dominant: true},

	}

};
