'use strict';

var express = require('express');
var router  = express.Router();

var Course  = require('../models/course');
var Review  = require('../models/review');
var User    = require('../models/user');


/**
 * GET /api/courses
 * 200
 * Returns course "_id" and "title" properties of all available courses
 */
router.get('/courses', function(req, res, next) {
    Course
        .find({})
        .select('title')
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
            res.json( { data: [course] });
        });
});


/**
 * POST /api/courses
 * 201
 * Creates a course, sets the Location header, and returns no content
 */
router.post('/courses', function(req, res, next) {
    res.send('POST /api/courses 201');
});


/**
 * PUT /api/courses/:id
 * 204
 * Updates a course and returns no content
 */
router.put('/courses/:id', function(req, res, next) {
    res.send('PUT /api/courses/:id 204');
});


/**
 * GET /api/users
 * 200
 * Returns the currently authenticated user
 */
router.get('/users', function(req, res, next) {
    res.send('GET /api/users 200');
});


/**
 * POST /api/users
 * 201
 * Creates a user, sets the Location header to "/", and returns no content
 */
router.post('/users', function(req, res, next) {
    res.send('POST /api/users 201 ');
});


/**
 * POST /api/courses/:courseId/reviews
 * 201
 * Creates a review for the specified course ID, sets the Location header
 * to the related course, and returns no content
 */
router.post('/courses/:courseId/reviews', function(req, res, next) {
    res.send('POST /api/courses/:courseId/reviews 201');
});


/** 
 * DELETE /api/courses/:courseId/reviews/:id
 * 204
 * Deletes the specified review and returns no content
 */
router.delete('/courses/:courseId/reviews/:id', function(req, res, next) {
    res.send('DELETE /api/courses/:courseId/reviews/:id 204');
});


module.exports = router;