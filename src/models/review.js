'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;


var reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    postedOn: {
        type: Date
    },
    rating: {
        type: Number
    },
    review: {
        type: String
    }
});



var Review = mongoose.model('Review', reviewSchema);
module.exports = Review;