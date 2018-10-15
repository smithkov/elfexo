var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var mongoose = require('mongoose').Schema;

var Recaptcha = require('express-recaptcha').Recaptcha;
var recaptcha = new Recaptcha('6Lc-zXIUAAAAACe_rS1Q8DP7BNbly8LolGJGxcb3', '6Lc-zXIUAAAAANQ7gn9T32ahpdd21lIWUxpe55AC');
var Token = require('../models/token');
var TokenEmail = require('../models/tokenEmail');
var User = require('../models/user');
var Mailer = require('../my_modules/mailer');
var ObjectID = require('mongodb').ObjectID;
const url ="https://namdex.herokuapp.com";
//const url = "http://localhost:3000";
const verifyPath = "/verifyAccount/";
const verifyUrl = url+verifyPath;
const forgotPasswordUrl = url +"/resetPassword/";
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
// Register
router.get('/register',recaptcha.middleware.render,function (req, res) {
	res.render('register');
});

// Login
router.get('/login',recaptcha.middleware.render,function (req, res) {

	res.render('login', {captcha:res.recaptcha});
});

router.get('/resendVerification',ensureAuthenticated,function (req, res) {

	var userId = req.user.id.toString();

	Token.getTokenById(userId,function(err,token){
		if (err) throw err;
    var link = verifyUrl+userId;
		if(token){
				token.token = userId;
				token.save(function (err) {
					 if (err) {

						}
						Mailer.sendMail([{name:req.user.name,email:req.user.email,link:link,isVerify:true}]);
			 });
		}
		else{
				var token = new Token({
					 _userId:userId,
					 token :userId
				})
				Token.createToken(token,function(err,token){
						Mailer.sendMail([{name:req.user.name,email:req.user.email,link:link,isVerify:true}]);
				})
		}
	})
	req.flash('success_msg', 'Verification link has been resent to your email');
	res.redirect('/dashboard');
});

router.post('/login',recaptcha.middleware.verify,captchaVerificationLogin,passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login', failureFlash: true }),function (req, res, next) {
//router.post('/login',passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login', failureFlash: true }),function (req, res, next) {

   res.redirect('/dashboard');
});

router.get('/verifyAccount/:_id',function (req, res, next) {
		let userId = req.params._id;
		let viewName = "AccountVerify";
		Token.getTokenById(userId,function(err,token){
			if(!token){
					return res.render(viewName,{errorMsg:true,message:'We were unable to find a valid token. Your token may have expired.'});
			}
			User.getUserById(userId, function(err,user){
				 if(!user){
					 	return res.render(viewName,{errorMsg:true,message:'We were unable to find a user for this token.'});
				 }
				 if(user.status){
					 return res.render(viewName,{errorMsg:true,message:'This user has already been verified.'});
				 }
				 else{
						user.status = true;
						user.save(function (err) {
							 if (err) {

								}
								 return res.render(viewName,{errorMsg:false,message:'The account has been verified. Please log in.'});
					 });
				 }
			});

		})
});

router.get('/forgotPassword',function (req, res, next) {

    res.render('forgotPassword');
});

router.post('/forgotPassword',function (req, res, next) {
	  var email = req.body.email;

		User.getUserByEmail(email, function(err,user){
			if(err){
				throw err;
			}
			var id = Math.floor(Math.random() * (100000 - 1000000)) + 10000000;
			if(user){
					var link = forgotPasswordUrl+id;
					var token = new TokenEmail({
						 _userId:user.id,
						 token :id
					})
					TokenEmail.createToken(token,function(err,token){
							Mailer.sendMail([{name:user.name,email:user.email,link:link,isVerify:false}]);
					});
			}
		});
	   res.render('forgotPassword',{message:"If this is an account in our system then you will receive an email shortly."});
});

router.get('/users',ensureAuthenticated, function(req, res, next) {
  if(req.user.roleId){
		User.getUsers(function(err,users){
			if(err){
				throw err;
			}
			res.render('users',{layout: 'layoutDashboard.handlebars',users:users,user:req.user});
		})
  }
  else{
    res.redirect("/login");
  }
});

router.get('/resetPassword/:_id',function (req, res, next) {
	let tokenId = req.params._id;
	TokenEmail.getTokenById(tokenId, function(err,token){
		if(err){
			throw err;
		}
    console.log(token)
		if(token){
	  	res.render('resetpassword',{errorMsg:false,userId:token._userId});
		}
		else {
			res.render('resetpassword',{errorMsg:true,message:'We were unable to find a user for this token.'});
		}
	})

});

router.post('/resetPassword',function (req, res, next) {

	var password = req.body.password;
	var password2 = req.body.password2;
	var userId = req.body.userId;

	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if (errors) {
		res.render('resetpassword', {
			errors: errors
		});
	}
	else {
		User.getUserById(userId, function(err,user){
			 if (err) throw err;
			 if(user){
				 user.password = password;

				 User.resetUserPassword(userId,user,{}, function (err, user) {
					 if (err) throw err;
             console.log(user.password)
						 return res.render("resetpassword",{done:'Password changed successfully.'});
				 });

			 }
			 else {
			 	    return res.render("resetpassword",{undone:'Password could not be changed.'});
			 }
		 })
	}

});
router.post('/register',recaptcha.middleware.verify,captchaVerificationRegister, function (req, res) {
// Register User
//router.post('/register', function (req, res) {
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if (errors) {
		res.render('register', {
			errors: errors
		});
	}
	else {
		//checking for email and username are already taken
		User.findOne({ username: {
			"$regex": "^" + username + "\\b", "$options": "i"
	}}, function (err, user) {
			User.findOne({ email: {
				"$regex": "^" + email + "\\b", "$options": "i"
		}}, function (err, mail) {
				if (user || mail) {
					res.render('register', {
						user: user,
						mail: mail
					});
				}
				else {
					var newUser = new User({
						name: name,
						email: email,
						username: username,
						status:false,
						password: password,
						roleId: false
					});
					User.createUser(newUser, function (err, user) {
						if (err) throw err;
						var userId = user.id.toString()
            var token = new Token({
							 _userId:userId,
							 token :userId
						})
						var link = verifyUrl+userId;
						Token.createToken(token,function(err,token){
								Mailer.sendMail([{name:user.name,email:user.email,link:link,isVerify:true}]);
						})
					});
         	req.flash('success_msg', 'You are registered and can now login');
					res.redirect('/login');
				}
			});
		});
	}
});

passport.use(new LocalStrategy(
	function (username, password, done) {
		User.getUserByUsername(username, function (err, user) {
			if (err) throw err;
			if (!user) {
				return done(null, false, { message: 'Unknown User' });
			}

			User.comparePassword(password, user.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Invalid password' });
				}
			});
		});
	}));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.getUserById(id, function (err, user) {
		done(err, user);
	});
});



function captchaVerificationLogin(req, res, next) {
	if (req.recaptcha.error) {
			req.flash('error_msg','Captcha not correct');
			res.redirect('/login');
	} else {
			return next();
	}

};
function captchaVerificationRegister(req, res, next) {
	if (req.recaptcha.error) {
			req.flash('error_msg','Captcha not correct');
			res.redirect('/register');
	} else {
			return next();
	}

};

router.get('/logout', function (req, res) {
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/login');
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
