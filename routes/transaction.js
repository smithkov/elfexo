var express = require('express');
var router = express.Router();
var multer = require('multer');
var Crypto = require('../models/cryptos');
var Transac = require('../models/transactions');


router.getImages = function(callback, limit) {
 Transac.find(callback).limit(limit);
}

router.updateTransaction = function(id, transact, options, callback){
	var query = {_id:id};

	Transac.findOneAndUpdate(query,transact, options,callback);
}
router.removeImage = function(id, callback){
	var query = {_id:id};

	Transac.remove(query,callback);
}
router.getTransactionByUser = function(_userId, callback){
	var query = {userId:_userId};

	Transac.find(query,callback).populate('coinId');
}
router.getTransactionByStatus = function(_isApprove, callback){
	var query = {txStatus:_isApprove};
	Transac.find(query,callback);
}

router.getAllTransactions = function(callback,limit){
	Transac.find(callback).limit(limit).populate('coinId').populate('userId');
}

router.getTransactionById = function(id, callback) {
  Transac.findById(id, callback);
}

router.addTransaction = function(tnx, callback) {
 Transac.create(tnx, callback);
}


router.get('/myTransaction',ensureAuthenticated, function(req, res, next) {
  //if(req.user.roleId){
  router.getTransactionByUser(req.user.id,function(err,transactions){
    if(err){
      throw err;
    }
    //Object.entries(transactions).forEach(([key, value]) => console.log(transactions[key].transactionDate.toDateString()))
     res.render('usertransaction',{layout: 'layoutDashboard.handlebars',transactions:transactions,user:req.user});
  })
});

router.get('/allTransaction',ensureAuthenticated, function(req, res, next) {
  //if(req.user.roleId){
  router.getAllTransactions(function(err,transactions){
    if(err){
      throw err;
    }
    //Object.entries(transactions).forEach(([key, value]) => console.log(transactions[key].transactionDate.toDateString()))
     res.render('alltransaction',{layout: 'layoutDashboard.handlebars',transactions:transactions,user:req.user});
  })
});

router.get('/toggle/:_id',ensureAuthenticated, function(req, res, next) {
  //if(req.user.roleId){
  var id = req.params._id;
  router.getTransactionById(id,function(err,transaction){
    if(err){
      throw err;
    }
    if(transaction.txStatus)
        transaction.txStatus = false;
      else
        transaction.txStatus = true;

    router.updateTransaction(id,transaction,{},function(err,tnx){
  		if(err){
  			throw err;
  		}
    //  req.flash('success_msg',image.coinName+ ' have been modified successfully');
      res.redirect("/transaction/allTransaction");
  	})
  })
});

router.post('/payment',ensureAuthenticated,function(req, res, next) {

    var name = req.body.name;
    var buyPrice = req.body.price;
    var amount = req.body.amount;
    var total = req.body.total;
    var wallet = req.body.walletAddr;
    var coinId = req.body.coinId;
    var a = Math.floor(Math.random() * (1000 - 10000)) + 100000;
    var b = Math.floor(Math.random() * (1000 - 10000)) + 100000;
  	var newTransact = new Transac({
      transactionId: a+""+b,
      buyPrice: buyPrice,
      total:total,
      amount:amount,
      walletAddress: wallet,
      txStatus: false,
      coinId: coinId,
      userId: req.user.id,
    });

    router.addTransaction(newTransact, function(err,tnx) {
      if (err) throw err;
      console.log(tnx);
    });
    req.flash('success_msg', 'Your transaction has gone through');
    res.redirect("/transaction/finaltnx");
});

router.get('/finaltnx', ensureAuthenticated,function(req, res, next) {

   res.render('finaltransaction',{layout: 'layoutDashboard.handlebars',user: req.user});
});

router.post('/dashboardPost', function(req, res, next) {
    var name = req.body.name;
    var price = req.body.price;
    var amount = req.body.amount;
    var total = req.body.total;
    var coinId = req.body.coinId;

    req.checkBody('price','Price is required').notEmpty();
    req.checkBody('amount','Amount is required').notEmpty();
    req.checkBody('name','Name is required').notEmpty();
    req.checkBody('total','Total is required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
  		res.render('dashboard', {
  			errors: errors,layout: 'layoutDashboard.handlebars'
  		});
  	}
  	else {

      var txnValues = {"name":name,"price":price,"amount":amount, "total":total,"coinId":coinId};
      res.render('purchaselisting', {
        values: txnValues,layout: 'layoutDashboard.handlebars'
      });
    }



});
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/login');
	}
}

module.exports = router;
