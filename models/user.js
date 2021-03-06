var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	dor: {
	 type: Date,
	 default: Date.now
	},
	name: {
		type: String
	},
	status: {
		type: Boolean
	},
	roleId: {
		type: Boolean
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.resetUserPassword= function(id,user,options, callback){
	bcrypt.genSalt(10, function(err, salt) {

	    bcrypt.hash(user.password, salt, function(err, hash) {
          user.password = hash;
					var query = {_id:id};

					 console.log(user.password)
					User.findByIdAndUpdate(query,{password:user.password}, options,callback);
	    });
	});
}
module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserByEmail = function(email, callback){
	var query = {email: email};
	User.findOne(query, callback);
}

module.exports.getUsers = function(callback, limit) {
 User.find(callback).limit(limit);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}
