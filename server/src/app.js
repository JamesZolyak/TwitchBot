var fs = require('fs');
var path = require('path');
var express = require('express');
var compression = require('compression');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var util = require('util');
var url = require('url');
var passport = require('passport');
var TwitchtvStrategy = require('passport-twitchtv').Strategy;
var router = require('./router.js');
var dbURL = process.env.MONGOLAB_URI || "mongodb://localhost/DomoMaker";
var botConfig = require('./bot.js');

//hooks up database connection
var db = mongoose.connect(dbURL, function(err) {
	if(err){
		console.log("Could not connect to database");
		throw err;
	}
});

//config for the chat bot
var config = {
	   channels: "#angel_of_weir",
	   server: "irc.twitch.tv",
	   port: 6667,
	   secure: false,
	   nick: "AngelofBot",
	   password: "oauth:eo1ofzyovwspmjof9cktnf1qiwh83s"
    };

var TWITCHTV_CLIENT_ID = "ed0if5unar3r0dxq6hq1z4v4o7x8cov";
var TWITCHTV_CLIENT_SECRET = "6281bim5qeyxf03qcndqubmga0y0oen";

var port = process.env.PORT || process.env.NODE_PORT || 10000;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
//hooks passport up with twitch to allow for authorization 
passport.use(new TwitchtvStrategy({
    clientID: TWITCHTV_CLIENT_ID,
    clientSecret: TWITCHTV_CLIENT_SECRET,
    callbackURL: "https://radiant-badlands-8294.herokuapp.com/auth/twitchtv/callback",
    scope: "user_read"
  },
  function(accessToken, refreshToken, profile, done) {

    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

var app = express();

app.use('/assets', express.static(path.resolve(__dirname+'../../client/')));
app.use(compression());
app.use(bodyParser.urlencoded({
		extended: true
}));

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(favicon(__dirname + '/../client/img/favicon.png'));
app.disable('x-powered-by');
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

router(app);

var server = app.listen(port, function(err){
	if(err) {
		throw err;
	}
	console.log('Listening on port ' + port);
});

//socket io is used for communication from the chat bot to the outside client with rdio webplayer and back.
var io = require('socket.io').listen(server);
var ifConnected = false;
io.on('connection', function (socket) {
    if(!ifConnected){
        ifConnected = true;
        botConfig(app,socket,config);
    }
    socket.on('disconnect', function(socket){
        ifConnected = false;
        io = null;
        botConfig = null;
    });
});

