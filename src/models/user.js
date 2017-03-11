'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;


var userSchema = new Schema({
    fullName: {
        type: String
    },
    emailAddress: {
        type: String
    },
    hashedPassword: {
        type: String
    }
});


var User = mongoose.model('User', userSchema);
module.exports = User;