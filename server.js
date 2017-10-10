const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose');
const passport = require('passport');

const config = require('./config.json');

const userApi = require('./modules/api/users/userController');

var app = express();

app.use(bodyParser.json({ extended : true}));
app.use(bodyParser.urlencoded({ extended : true}));
app.use(cookieParser());
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(config.connectionDatabase, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Connect to db success');
  }
});

app.use('/api/user', userApi);

app.use(express.static(__dirname + "/public"));

app.listen(config.port , () => {
  console.log(`App listen on ${config.port}`);
})
