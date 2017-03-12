'use strict';

var mongoose  = require('mongoose');
var bcrypt    = require('bcrypt');
var validator = require('validator');
var Schema    = mongoose.Schema;

mongoose.Promise = global.Promise;




var userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, 'A name for the user is required.'],
        trim: true
    },
    emailAddress: {
        type: String,
        required: [true, 'An email address is required.'],
        unique: true,
        trim: true
    },
    hashedPassword: {
        type: String,
        required: [true, 'Passwords empty or do not match.'],
        trim: true
    }
});


// Encrypt the password before saving to database
userSchema
    .pre('save', function (next) {
        var user = this;
        bcrypt.hash(user.hashedPassword, 10, function (err, hash) {
            if (err) return next(err);
            user.hashedPassword = hash;
            return next();
        });
});


// Validate the email is in correct format
userSchema
    .path('emailAddress')
    .validate(function (email) {
        return validator.isEmail(email);
    }, 'Email address must be valid');



// Authenticate user
userSchema
    .statics.authenticate = function (email, password, callback) {
        User.findOne({ emailAddress: email })
            .exec(function (err, user) {
                if (err) return callback(err);
                else if (!user) {
                    let err = new Error('User not found.');
                    err.status = 401;
                    return callback(err);
                }
                bcrypt.compare(password, user.hashedPassword, function (err, result) {
                    if (result) return callback(null, user);
                    else return callback();
                });
            });
    }



var User = mongoose.model('User', userSchema);
module.exports = User;