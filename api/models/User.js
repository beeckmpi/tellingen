/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

var bcrypt = require('bcrypt-nodejs');

function hashPassword(values, next) {
	bcrypt.hash(values.password, null, null, function(err, hash) {
		if(err) return console.log(err);
	    values.password = hash;
	    next();
	});
}

module.exports = {	
	attributes: {
	    username: {
	      type: 'string',
	      required: true,
	      unique: true,
	      index: true
	    },
	    organisatie: {
	      type:'string',
	      required: true,
	      index: true
	    },
	    firstName: {
	      type: 'string',
	      required: true
	    },
	    lastName: {
	      type: 'string',
	      required: true
	    },
	    email: {
	      type: 'email',
	      required: true,
	      unique: true
	    },
	    password: {
	      type: 'string',
	      minLength: 6,
	      required: true,	
	    },
	    rol: {
	    	type: 'string',
	      	index: true
	    },
	    mailConfirmed: {
	    	type: 'boolean'
	    },
	     // Override toJSON instance method to remove password value
        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        },
        validPassword: function(password, callback) {
            var obj = this.toObject();
            if (callback) {
                //callback (err, res)
                return bcrypt.compare(password, obj.password, callback);
            }
            return bcrypt.compareSync(password, obj.password);
        }
	},


  // Lifecycle Callbacks
	beforeCreate: function(values, next) {	  		
	    values.rol = "niet_geautoriseerd";
	    values.mailConfirmed = false;
	    values.telefoon= '';
	    values.gsm = '';
	    values.fax = '';
	    delete values.confirmPassword;
	    delete values.confirmEmail;
	    hashPassword(values, next);
	},
	beforeUpdate: function(values, next) {
        if (values.password) {
            hashPassword(values, next);
        } else {
        	next();
        }        
    }
};
