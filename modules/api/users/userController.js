const express = require('express');
const Router = express.Router();
const userModel = require('./userModel');
const passport = require('passport');

Router.post('/login', (req, res, next) => {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send(info);
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.send(req.session.passport.user);
    });
  })(req, res, next);
});

Router.post('/register', function(req, res) {
  let newUser = {
    username: req.body.username,
    password: req.body.password,
    fullname: req.body.fullname,
    email: req.body.email,
    avatar: req.body.avatar,
    dob: req.body.dob
  }

  userModel.createUser(newUser, (err, doc) => {
    if (err) {
      res.send(err);
    } else {
      passport.authenticate('local')(req, res, function() {
        res.send(`logined as ${doc.username}`);
      });
    }
  });
});

Router.get('/logout', (req, res) => {
  req.logout();
  res.send(req.session);
});

Router.get('/', (req, res, next) => {
  let token = req.session.passport.user;
  req.headers.authorization = "JWT " + req.session.passport.user;
  passport.authenticate('jwt', {
      session: false
    },
    (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send(info);
      } else {
        res.json({user, token});
      }
    })(req, res, next);
});


module.exports = Router;
