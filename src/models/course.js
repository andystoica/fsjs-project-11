'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;



var courseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    estimatedTime: {
        type: String
    },
    materialsNeeded: {
        type: String
    },
    steps: [{
        stepNumber: Number,
        title: String
    }],
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});



courseSchema.virtual('overallRating').get(function (){
    let numReviews = this.reviews.length;
    let totalScore = this.reviews.reduce((a, b) => a.rating + b.rating);
    return Math.round(totalScore / numReviews);
});



var Course = mongoose.model('Course', courseSchema);
module.exports = Course;
