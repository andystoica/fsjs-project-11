'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

mongoose.Promise = global.Promise;


var reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    postedOn: {
        type: Date,
        default: Date.now
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Each review must have a rating between 1 and 5.']
    },
    review: {
        type: String
    }
});

// Review is always a whole number
reviewSchema
    .pre('save', function (next) {
        Math.round(this.rating);
        return next();
    });


var Review = mongoose.model('Review', reviewSchema);
module.exports = Review;