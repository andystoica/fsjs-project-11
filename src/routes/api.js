'use strict';

/**
 * GET /api/courses | 200
 * Returns the Course "_id" and "title" properties
 * 
 * GET /api/course/:id | 200
 * Returns all Course properties and related documents for the provided course ID
 * 
 * POST /api/courses | 201
 * Creates a course, sets the Location header, and returns no content
 * 
 * PUT /api/courses/:id | 204
 * Updates a course and returns no content
 *
 * GET /api/users | 200
 * Returns the currently authenticated user
 * 
 * POST /api/users | 201
 * Creates a user, sets the Location header to "/", and returns no content
 * 
 * POST /api/courses/:courseId/reviews | 201
 * Creates a review for the specified course ID, sets the Location header
 * to the related course and returns no content
 * 
 * DELETE /api/courses/:courseId/reviews/:id | 204
 * Deletes the specified review and returns no content
 */

var express = require('express');
var router  = express.Router();
var mid     = require('../middleware');

var Course  = require('../models/course');
var Review  = require('../models/review');
var User    = require('../models/user');




/**
 * GET /api/courses
 * 200
 * Returns course "_id" and "title" properties of all available courses
 * { data: { _id, title } }
 */
router.get('/courses', function(req, res, next) {
    Course
        .find()
        .select('_id, title')
        .exec(function (err, courses) {
            if (err) return next(err);
            res.status(200);
            res.json({ data: courses });
        });
});




/**
 * GET /api/course/:id
 * 200
 * Returns all Course properties and related documents for the provided course ID
 * { data: [ courseObject ] }
 */
router.get('/courses/:id', function(req, res, next) {
    Course
        .findById(req.params.id)
        .populate({
            path: 'user',
            model: 'User'
        })
        .populate({
            path: 'reviews',
            model: 'Review',
            populate: {
                path: 'user',
                model: 'User'
            }
        })
        .exec(function (err, course) {
            if (err) return next(err);
            res.status(200);
            res.json({ data: [course.toJSON({ virtuals: true })] });
        });
});




/**
 * POST /api/courses
 * 201
 * Creates a course, sets the Location header, and returns no content
 */
router.post('/courses', mid.requireAuth, function(req, res, next) {
    
    // Make a new course object
    let course = new Course(req.body);

    // Attempt to save the new course
    course.save(function (err) {
        if (err) {
            if (err.name === 'ValidationError') {
                // Handle validation errors
                res.status(400);
                res.json(validationErrors(400, err.errors));
            } else {
                return next(err);
            }
        } else {
            // Set headers and send the response
            res.status(201).location('/').send();
        }
    });
});




/**
 * PUT /api/courses/:id
 * 204
 * Updates a course and returns no content
 */
router.put('/courses/:id', function(req, res, next) {
    
    // Make a new course object
    let course = new Course(req.body);

    // Attempt to save the new course
    Course.update({ _id: course._id }, course, function (err) {
        if (err) {
            if (err.name === 'ValidationError') {
                // Handle validation errors
                res.status(400);
                res.json(validationErrors(400, err.errors));
            } else {
                return next(err);
            }
        } else {
            // Set headers and send the response
            res.status(204).send();
        }
    });
});




/**
 * GET /api/users
 * 200
 * Returns the currently authenticated user
 * { fullName, emailAddress }
 */
router.get('/users', mid.requireAuth, function(req, res, next) {

    User.findOne({ _id: req.userId })
        .select('-hashedPassword')
        .exec(function (err, user) {
            if (err) return next(err);
            res.status(200).json({ data: [user] });
        });    
});




/**
 * POST /api/users
 * 201
 * Creates a user, sets the Location header to "/", and returns no content
 */
router.post('/users', function(req, res, next) {

    // Check for password match
    let password = '';
    if (req.body
        && req.body.password
        && req.body.confirmPassword
        && req.body.password === req.body.confirmPassword) {
            password = req.body.password;
    }

    // Make a new user object
    let user = new User({
        fullName: req.body.fullName,
        emailAddress: req.body.emailAddress,
        hashedPassword: password
    });

    // Attempt to save the new user
    user.save(function (err) {
        if (err) {
            if (err.name === 'ValidationError') {
                // Handle validation errors
                res.status(400);
                res.json(validationErrors(400, err.errors));
            } else {
                return next(err);
            }
        } else {
            // Set headers and send the response
            res.status(201).location('/').send();
        }
    });
});




/**
 * POST /api/courses/:courseId/reviews
 * 201
 * Creates a review for the specified course ID, sets the Location header
 * to the related course, and returns no content
 */
router.post('/courses/:courseId/reviews', mid.requireAuth, function(req, res, next) {

    // Make a new review object and add the user ID
    req.body.user = req.userId;
    let review = new Review(req.body);

    // Save the review
    review.save(function (err) {
        
        // Handle any errors
        if (err) {
            if (err.name === 'ValidationError') {
                // Handle validation errors
                res.status(400);
                res.json(validationErrors(400, err.errors));
            } else {
                // Any other erors
                return next(err);
            }

        // Get the course from database
        } else {
            Course.findOne({ _id: req.params.courseId }, function (err, course) {
                if (err) return next(err);
                
                // Link review to course and save
                course.reviews.push(review._id);
                course.save(function (err, updated) {
                    if (err) return next(err);                    
                    // Set headers to redirect to article location
                    res.status(201).location('/courses/' + updated._id).send();
                });
            });
        }
    });
});




/** 
 * DELETE /api/courses/:courseId/reviews/:id
 * 204
 * Deletes the specified review and returns no content
 */
router.delete('/courses/:courseId/reviews/:id', mid.requireAuth, function(req, res, next) {
    
    // Find the course in the database
    Course
        .findById(req.params.courseId)
        .exec(function (err, course) {
            if (err) return next(err);
        
            // Remove reivew from course
            course.reviews.pull(req.params.id);
            course.save(function (err, updated){
                if (err) return next(err);

                // Remove review from database
                Review
                    .remove({ _id: req.params.id })
                    .exec(function (err) {
                        if (err) return next(err);

                        // Send 204 status and terminate response
                        res.status(204).send();
                    });
            });  
        });
});




/**
 * Helper function for format validation messages
 * 
 * @param {Number} code Error code for API to return
 * @param {Error} errors Error messages returned by the validator
 */
function validationErrors(code, errors) {
    
    let errMessages = [];

    for (let err in errors) {
        if (errors[err] && errors[err].message) {
            errMessages.push({
                code: code,
                message: errors[err].message
            });
        }
    }

    return {
        message: 'Validation Failed',
        errors: {
            property: errMessages
        }
    };
}

module.exports = router;