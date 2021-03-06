const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const Entry = require('./models/entry');
const user = require('./middleware/user');
const validate = require('./middleware/validate');
const messages = require('./middleware/messages');
const page = require('./middleware/page');
const entries = require('./routes/entries');
const register = require('./routes/register');
const login = require('./routes/login');

const api = require('./routes/api');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
// app.use(express.methodOverride());
app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));
app.use(messages);
app.use('/api', api.auth);
app.use(user);
//app.use(page);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', entries.list);
app.get('/post', entries.form);
app.post('/post', entries.submit, validate.required('entry[title]'), validate.lengthAbove('entry[title]', 4));
app.get('/register', register.form);
app.post('/register', register.submit);
app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/logout', login.logout);

app.get('/api/user/:id', api.user);
app.post('/api/entry', entries.submit);
app.get('/api/entries/:page?', page(Entry.conut), api.entries);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;