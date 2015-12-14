var irc = require("irc");
var models = require('./models');
var Account = models.Account;
var allowing = [];
var admins = ['Angel_of_Weir', 'AngelofBot', 'oreoplaysthings', 'Skylarkly'];
//Sets up the bot
var botConfig = function(app, socket,config){

    //creates a new IRC connection
    var bot = new irc.Client(config.server, config.nick, {
	   channels: [config.channels + " " + config.password],
	   debug: false,
	   password: config.password,
	   username: config.nick
    });   
    
    socket.on("message", function(message){
        bot.say(config.channels, message);
    });
    
    //listens for when users join the chat 
    //this can be used to great new people to the channelor welcome back returning viewers
    bot.addListener("join", function(channel, user){
	   user = user.trim();
	   if(user === "angelofbot"){
	       console.log(user + " recognized as joined.");
	   }  
	   else{
	       console.log(user + " joined the chat!");
	       var mes = "Welcome to the channel, " + user + "!";
	   }        
    });
    
    //this listens to the irc chat for any messages
    //it then logs them into the database so they can be viewed at a later date i.e. arguments in chat where people get banned
    //I can use this to see what was said since /timeout and /ban delete all messages made by the banned/timedout users
    bot.addListener("message", function(user, channel, text){
        console.log(user + ": " + text);
    
        var accountData = {
            username: user,
            message: text
        };
        var account = new Account.AccountModel(accountData); 
        
        account.save(function(err) {
		   if(err){
	           console.log(err);
		   }
        });
        
        text = text.trim();
        if(scanForLink(text,channel)){
            if(!adminCheck(user)){
              if(!checkAllowing(user)){
                  bot.say(channel, "/timeout "+user+" 20");
                  bot.say(channel, "Gottan ask for permission first bud!");
                  
                //checkViolations(from);
              }
              //return;
            }
        }

        if(text.substr(0,1) == "!"){
            parseCommand(text.substr(1).toLowerCase(),channel,user);
            
            return;
        }
        else{
            socket.emit('message', { message: user + ": " + text });
        }
    });
    
    //this parses all commands and has them perform appropriate actions
    //help just states all of the commands minus allow which is a command for admins/mods only 
    //that command gives any user that is not an admin/mod the ability to post a link in the chat. Without that permission the user is auto timed out by the bot
    var parseCommand = function(command, channel, user){
        command = command.split(' ');
        console.log(command);

        switch(command[0]){
            case "help":
                bot.say(channel,"Bot commands are as follows: !help !skip !back !songname");
                break;
            case "skip":
                sendCommand(user,command[0]);
                break;
            case "back":
                sendCommand(user,command[0]);
                break;
            case "songname":
                sendCommand(user,command[0]);
                break;
            case "allow":
                if(adminCheck(user)){
                    allowing.push(command[1]);
                    bot.say(channel, "Ya got 2 minutes to post that link" + command[1]);
                    setTimeout(function(){noMoreLinks(command[1]);},120000);
                }
                else{
                    bot.say(channel,"Nice try, "+user+", but I do not obey you.");
                }
                break;

            default:
                if(command[0].length > 1){
                    //bot.say(channel, "nope");
                    console.log("nope");
                }
        }
    };
    
    //this function removes a user from the list of users approved for links
    var noMoreLinks = function(user){
        bot.say(channel,'/me  is no longer accepting links from ' + user);
        for(var i = 0; i < allowing.length; i++){
            if(user === allowing[i]){
                allowing.splice(i,1);
            }
        }
    };
    
    //this passes text through a simple regex to determine if it is a link or not
    var scanForLink = function(text,channel){
        var re = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/;
        if(text.match(re) !== null){
            return true; 
        }else{
            return false;
        }
    };
    
    //this function checks to see if a user is allowed to post a link at the current time
    var checkAllowing = function(from){
        for(var i = 0; i < allowing.length; i++){
            if(allowing[i] === from){
                return true;
            }
        }
        return false;
    };
    
    //this function checks to see if the poster is on the admin/mod team or not
    var adminCheck = function(name){
        for(var i=0; i< admins.length; i++){
            if(admins[i] === name){
                return true;
            }
        }
        return false;
    };
    
    //this function sends a command to the client socket io
    var sendCommand = function(user, command){
        socket.emit('command', { message: user + ": " + command, command: command });
    };
};

module.exports = botConfig;
