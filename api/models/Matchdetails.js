/**
 * Matchdetails.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        match:{model:'match'},
        radiant_win:'boolean',
        duration:'integer',
        first_blood_time:'integer',
        game_mode:'integer', //convert to enum
        source:'json'
	}

};
