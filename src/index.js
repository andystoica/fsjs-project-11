'use strict';

// load modules
var express    = require('express');
var morgan     = require('morgan');
var apiRouter  = require('./routes');
var bodyParser = require('body-parser');

var app = express();




// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan('dev'));

// setup our static route to serve files from the "public" folder
app.use('/', express.static('public'));

// parse the incomming request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));





// api routes
app.use('/api', apiRouter);


// catch 404 errors and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Document not found.');
  err.status = 404;
  return next(err);
});

// error handler
app.use(function (err, req, res, next) {
  if (res.headerSent) return next(err);
  res.status(err.status || 500);
  res.json({ error: err.message || 'Something went wrong.' });
});



// start listening on our port
var server = app.listen(app.get('port'), function () {
  console.log('Express server is listening on port ' + server.address().port);  
});
