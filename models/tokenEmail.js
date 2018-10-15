var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tokenEmailSchema = mongoose.Schema({
  _userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
   token: { type: String, required: true },
   createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});

var Token = module.exports = mongoose.model('TokenEmail', tokenEmailSchema);

module.exports.createToken = function(newToken, callback){
  newToken.save(callback);
}

module.exports.getTokenById = function(tokenId, callback){
	Token.findOne({token:tokenId},(callback));
}
