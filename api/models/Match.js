/**
 * Match.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        match_id:{type: 'integer',unique:true,required:true},
        players:{collection:'player',via:'matches',dominant:true},
        match_seq_num:{type:'integer',unique:true},
        lobby_type:'integer', //convert to enum
        start_time: 'date',
        details:{model:'matchdetails'},
        playerdetails:{collection: 'playerdetails',via:'match'}
	}

};
