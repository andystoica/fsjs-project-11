'use strict';

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

mongoose.Promise = global.Promise;




var courseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'A course must have a title.']
    },
    description: {
        type: String,
        required: [true, 'A course must have a description.']
    },
    estimatedTime: {
        type: String
    },
    materialsNeeded: {
        type: String
    },
    steps: [{
        stepNumber: Number,
        title: {
            type: String,
            required: [true, 'Each step must have a title.']
        },
        description: {
            type: String,
            required: [true, 'Each step must have a description.']
        }
    }],
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});




// overallRating virtual field
courseSchema.virtual('overallRating').get(function (){
    let numReviews = this.reviews.length;
    let totalScore = 0;
    this.reviews.forEach(function (review) {
        totalScore += review.rating;
    });
    return Math.round(totalScore / numReviews);
});




var Course = mongoose.model('Course', courseSchema);
module.exports = Course;