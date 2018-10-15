var express = require('express');
var router = express.Router();
var Crypto = require('../models/cryptos');
var User = require('../models/user');
var transactRouter = require('../routes/transaction');

// Get Homepage
// router.get('/', ensureAuthenticated, function(req, res){
// 	res.render('index');
// });
router.getCryptos = function(callback, limit) {
 Crypto.find(callback).limit(limit);
}
router.get('/', function(req, res){
  router.getCryptos(function(err,cryptos){
      if(err){
        throw err;
      }
  	   res.render('index',{cryptos:cryptos});
      });
  });

router.get('/dashboard',ensureAuthenticated, function(req, res){

  transactRouter.getAllTransactions(function(err,transactions){
    if(err){
      throw err;
    }
    router.getCryptos(function(err,cryptos){
      if(err){
        throw err;
      }
        transactRouter.getTransactionByStatus(false,function(err,transacByStatus){
          if(err){
            throw err;
          }
          User.getUsers(function(err,users){
            if(err){
              throw err;
            }
            var approvedtranactions = parseInt(transactions.length)  - parseInt(transacByStatus.length);
            res.render('dashboard',{layout: 'layoutDashboard.handlebars',users:users.length,approved:approvedtranactions,cryptos:cryptos,transaction:transactions.length,transacByStatus:transacByStatus.length,user:req.user});
          })

        });
    });
  });


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
