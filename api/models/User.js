/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
        username  : { type: 'string'},
        passports : { collection: 'Passport', via: 'user' },
        steam_id:{type:'string',unique:true},
        avatar:'string',
        avatarmedium:'string',
        avatarfull:'string'



	}


};
