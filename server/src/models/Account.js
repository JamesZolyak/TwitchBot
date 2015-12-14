var mongoose = require('mongoose');
var _ = require('underscore');

var AccountModel;

//this creates a new account schema for saving data to the database
var AccountSchema = new mongoose.Schema({
    
    username: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        trim: true
    },
    createdData: {
        type: Date,
        default: Date.now
    }

});

//this puts the data from a user and message in the form useful for saving to the database
AccountSchema.methods.toAPI = function() {
    //_id is built into your mongo document and is guaranteed to be unique
    return {
        username: this.username,
        message: this.message,
        _id: this._id
    };
};

//this returns all messages said in the chat while the client and bot were running
AccountSchema.statics.findMessages = function(req, callback) {
    //console.log(username);
	
	return AccountModel.find().exec(callback);
};



AccountModel = mongoose.model('Account', AccountSchema);


module.exports.AccountModel = AccountModel;
module.exports.AccountSchema = AccountSchema;