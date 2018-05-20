const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();
const expressValidator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const mongoDB = /*'mongodb://127.0.0.1/articlesapp'*/ process.env.database //'mongodb://godwinpeace22:godwinpeep@ds123929.mlab.com:23929/articlesapp';
const MongoDBStore = require('connect-mongodb-session')(session);
//const compression = require('compression');
mongoose.connect(mongoDB);
//get the default connection
var db = mongoose.connection;
//bind connecton to error event(to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const index = require('./routes/index');
const users = require('./routes/users');
const dashboard = require('./routes/dashboard');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());
app.use(expressValidator());
app.use(require('express-session')({
    secret: 'supersecretecatkeyguyfalsetrue',
    resave: false,
    saveUninitialized: false,
    cookie:{maxAge:365 * 24 * 60 * 60 * 1000},
    store: new MongoDBStore({
        uri: mongoDB,
        databaseName: 'articlesapp',
        collection: 'sessions'
      }).on('error', function(error) {
        assert.ifError(error);
        assert.ok(false);
      })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/profile', dashboard);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
