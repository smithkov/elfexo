var mongoose = require('mongoose');

var transactionSchema = mongoose.Schema({
   transactionId: {
     type: String
   },
   transactionDate: {
		type: Date,
		default: Date.now
   },
   buyPrice: {
     type: String
   },
   total: {
     type: String
   },
   amount: {
     type: String
   },
   walletAddress: {
     type: String,
     required: true
   },
   txStatus: {
     type: Boolean
   },
   coinId : { type: mongoose.Schema.Types.ObjectId, ref: 'Crypto' },
   userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Transaction', transactionSchema);
