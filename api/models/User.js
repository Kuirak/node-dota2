/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        username  : { type: 'string'},
        identifier:{type:'string',unique:true, required:true},
        steam_id:{type:'string',unique:true},
        avatar:'string',
        avatarmedium:'string',
        avatarfull:'string'
	}


};
