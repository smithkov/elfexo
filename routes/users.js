var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');

var Recaptcha = require('express-recaptcha').Recaptcha;
var recaptcha = new Recaptcha('6Lc-zXIUAAAAACe_rS1Q8DP7BNbly8LolGJGxcb3', '6Lc-zXIUAAAAANQ7gn9T32ahpdd21lIWUxpe55AC');

var User = require('../models/user');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
// Register
router.get('/register', function (req, res) {
	res.render('register');
});

// Login
router.get('/login',recaptcha.middleware.render,function (req, res) {
	res.render('login', {captcha:res.recaptcha});
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
// Register User
router.post('/register', function (req, res) {
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
						console.log(user);
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

router.post('/login',function (req, res, next) {

	if(!req.recaptcha.error){
		debugger;
		passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login', failureFlash: true });
			res.redirect('/dashboard');
	}else{
		debugger;
		res.redirect('/login');

	}

});

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
