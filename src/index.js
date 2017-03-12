'use strict';

// load modules
var express    = require('express');
var morgan     = require('morgan');
var apiRouter  = require('./routes/api');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var auth       = require('basic-auth');
var bcrypt     = require('bcrypt');

var app = express();

var Course  = require('./models/course');
var Review  = require('./models/review');
var User    = require('./models/user');




/**
 * Database connection
 */

// mongodb connection
mongoose.Promise = global.Promise;
mongoose
  .connect('mongodb://localhost:27017/course-rating-api')
  .catch(function (err) {
    console.log('MongoDB: connection error');
  });
var db = mongoose.connection;

db.on('error', function (err) {
  console.log('MongoDB: ' + err.message);
});

db.on('connected', function() {
  console.log('MongoDB: successfully connected');
});

db.on('disconnected', function() {
  console.log('MongoDB: disconnected');
});


// ---------------------------------------------
// var seeder     = require('mongoose-seeder');
// var seedData   = require('./data/data.json');

// db.once('open', function () {
//   seeder
//     .seed(seedData)
//     .catch(function (err) {
//       console.log(err);
//     });
// });
//---------------------------------------------


/**
 * Application setup
 */

// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan('dev'));

// parse the incomming request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// setup our static route to serve files from the "public" folder
app.use('/', express.static('public'));




/**
 * Authentication
 * 
 * Checks for Authorization headers, attempts to locate the user and
 * appends the userId to the request if a user is found with a matching
 * password.
 */

app.use(function (req, res, next) {
  
  // check for authorization headers
  let credentials = auth(req);
  if (credentials && credentials.name && credentials.pass) {
    
    // attepmpt to grab the user account from database
    User.findOne({ emailAddress: credentials.name })
        .exec(function (err, user) {
          if (err || !user) return next();
    
          // check for password match
          bcrypt.compare(credentials.pass, user.hashedPassword, function (err, check) {
            if (check) {
              console.log('Authorized!');
              req.userId = user._id;
            }
            return next();
          });
        });
  } else {
    return next();
  }
});






/**
 * Routes
 */

// api routes
app.use('/api', apiRouter);




/**
 * Error handling
 */

// catch 404 errors and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Document not found');
  err.status = 404;
  return next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // if (res.headerSent) return next(err);
  res.status(err.status || 500);
  res.json({ error: err.message || 'Something went wrong' });
});




/**
 * Start the application server
 */

// start listening on our port
var server = app.listen(app.get('port'), function () {
  console.log('Express: server listening on port ' + server.address().port);  
});
