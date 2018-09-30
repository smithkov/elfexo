var express = require('express');
var router = express.Router();
var multer = require('multer');
var Crypto = require('../models/cryptos');
const url = require('url');

router.getImages = function(callback, limit) {
 Crypto.find(callback).limit(limit);
}

router.removeImage = function(id, callback){
	var query = {_id:id};

	Crypto.remove(query,callback);
}

router.getImageById = function(id, callback) {
 Crypto.findById(id, callback);
}

router.addImage = function(image, callback) {
 Crypto.create(image, callback);
}

router.updateImage = function(id, image, options, callback){
	var query = {_id:id};
	var update = {
		coinName: image.coinName,
    sellPrice: image.sellPrice,
    buyPrice: image.buyPrice,
    initial: image.initial,
    path: image.path
	}
	Crypto.findOneAndUpdate(query,update, options,callback);
}

// To get more info about 'multer'.. you can go through https://www.npmjs.com/package/multer..
var storage = multer.diskStorage({
   destination: function(req, file, cb) {
     cb(null, 'public/uploads/')
   },
   filename: function(req, file, cb) {
     cb(null, file.originalname);
   }
});

var upload = multer({
   storage: storage
});

router.get('/coinAdd', ensureAuthenticated,function(req, res, next) {
    if(req.user.roleId){
        res.render('coinsave',{layout: 'layoutDashboard.handlebars',user: req.user});
    }
    else{
      res.redirect("/login");
    }

});

router.get('/coinListing',ensureAuthenticated, function(req, res, next) {
  if(req.user.roleId){
    router.getImages(function(err,cryptos){
      if(err){
        throw err;
      }
       res.render('coinlist',{layout: 'layoutDashboard.handlebars',cryptos:cryptos,user:req.user});
    })
  }
  else{
    res.redirect("/login");
  }
});

router.get('/updateCoin/:_id',ensureAuthenticated, function(req, res, next) {
  router.getImageById(req.params._id,function(err,crypto){
		if(err){
			throw err;
		}
      console.log(crypto);
      res.render('coinupdate',{layout: 'layoutDashboard.handlebars',crypto:crypto,user:req.user});
    });
});

router.get('/deleteCoin/:_id',ensureAuthenticated, function(req, res, next) {
  router.removeImage(req.params._id,function(err,crypto){
		if(err){
			throw err;
		}
      res.redirect('/coinListing');
    });
});

router.post('/updateCoinPost',upload.any(),ensureAuthenticated,function(req,res){
  if (req.files[0] != undefined){
    req.body.path = req.files[0].originalname;
  }
  var image = req.body;
  var id = req.body.id;
  console.log("id: "+ id);
  router.updateImage(id,image,{},function(err,image){
    if(err){
      throw err;
    }
    req.flash('success_msg',image.coinName+ ' have been modified successfully');
    res.redirect("/coinListing");
  })
});

router.post('/coinAdd', upload.any(),ensureAuthenticated, function(req, res, next) {
  if(req.user.roleId){
    var name = req.body.coinName;
    var buyPrice = req.body.buyPrice;
    var sellPrice = req.body.sellPrice;
    var initial = req.body.initial;

    req.checkBody('sellPrice', 'Sell Price is required').notEmpty();
    req.checkBody('buyPrice', 'Buy Price is required').notEmpty();
    req.checkBody('coinName', 'Coin Name is required').notEmpty();
    req.checkBody('initial', 'Initial is required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
  		res.render('coinsave', {
  			errors: errors
  		});
  	}
  	else {

        var pathName = req.files[0].path;
        var imageName = req.files[0].originalname;

      	var newCrypto = new Crypto({
          coinName: name,
          buyPrice: buyPrice,
          sellPrice:sellPrice,
          initial:initial,
          path: imageName,
          originalname: imageName
        });

        router.addImage(newCrypto, function(err,crypto) {
          if (err) throw err;
          console.log(crypto);
        });
        req.flash('success_msg', 'You have successfully added a new Crypto');
        res.redirect("/coinListing");
    }
  }
  else{
    res.redirect("/login")
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
