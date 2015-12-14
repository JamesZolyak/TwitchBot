var controllers = require('./controllers');
var models = require('./models');
var Account = models.Account;
var passport = require('passport');
var mid = require('./middleware');

//this sets up the router
//unfortuantely getting passport to play nice with the mvc structure was something I had a large amount of trouble with 
//for some reason, hence why there is some authentication done here
var router = function(app){
	app.get('/logout', controllers.Account.logout);
	app.get('/', controllers.Account.loginPage);

    app.get('/auth/twitchtv', passport.authenticate('twitchtv', { 
        scope: [ 'user_read','user_follows_edit','channel_read','chat_login' ] }),
            function(req, res){});
    app.get('/auth/twitchtv/callback', passport.authenticate('twitchtv', { 
        failureRedirect: '/failure'}),
        function(req, res) {
            
            res.render('account', {user: req.user});
        });
    
    app.get('/viewlogs', function(req,res){
        Account.AccountModel.findMessages(req, function(err,messages) {
            if(err) {
		  	console.log(err);
		  	
		  }
		  res.render('viewlogs', {messages: messages}); 
        }); 
        }
    );
};

module.exports = router;