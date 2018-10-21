var mongoose = require('mongoose');

var cryptoAccountSchema = mongoose.Schema({

   user: {
     type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },

   coin : {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Crypto'
   },
   transaction : {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'AccountTransaction'
   }

});

var CryptoAccount = module.exports = mongoose.model('CryptoAccount',cryptoAccountSchema);


module.exports.createCryptoAcct = function(acct, callback){
	  acct.save(callback);
};
module.exports.getAccTransactionById = function(id, callback){
  var query = {transaction:id};
	CryptoAccount.find(query, callback);
}

module.exports.getByUserId = function(id, callback){
  var query = {user:id};
	CryptoAccount.find(query, callback);
}
