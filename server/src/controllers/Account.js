var _ = require('underscore');
var passport = require('passport');
var models = require('../models');

var Account = models.Account;

//this handles the login paeg for the start of the app
var loginPage = function(req, res){
	res.render('login', { user: req.user });
};

//this handles the logout page for when a person is leaving 
var logout = function(req, res){
    req.logout();
	res.redirect('/');
    alert("You must close your browser and log out of twitch to truly log out!");
};

module.exports.loginPage = loginPage;
module.exports.logout = logout;