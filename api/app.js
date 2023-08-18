var createError = require('http-errors');
var express = require('express');
var axios = require('axios');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

/*
TODO: once this is all said and done, the draft objects are going to be stored server-side.
Theres a bunch of storage options out there to consider (various aws solns, mongodb, other)
and im not sure which one is best right now, so I think it might make sense to use a local storage
solution for the time being? IDK i remember that more complicated than it was worth during cis350,
might make sense to just pick some free storage option like mongo and change later if i need
*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// TODO: change origin to env variable for deployment
app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
  }));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
