var mongoose = require('mongoose');

var accountTransactionSchema = mongoose.Schema({
   transactionId: {
     type: String
   },
   transactionDate: {
		type: Date,
		default: Date.now
   },
   totalPrice: {
     type: String
   },
   refId: {
     type: String
   },
   txStatus: {
     type: Boolean
   },
   user : { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

var AccountTrans = module.exports = mongoose.model('AccountTransaction', accountTransactionSchema);


module.exports.amount = 5000;
module.exports.createAccTransaction = function(newTransaction, callback){
	  newTransaction.save(callback);
};

module.exports.getAccTransactions = function(callback, limit) {
 AccountTrans.find(callback).limit(limit);
}

module.exports.getAccTransactionByUserId = function(id, callback){
	AccountTrans.findById(id, callback);
}
