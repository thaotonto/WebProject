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
      } else {
        if (req.body.remember === true) {
          res.cookie('remember', req.session.passport.user);
        }
        return res.json({
          token: req.session.passport.user
        });
      }
    });
  })(req, res, next);
});

Router.post('/register', function(req, res, next) {
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
          } else {
            return res.json({
              token: req.session.passport.user
            });
          }
        });
      })(req, res, next);
    }
  });
});

Router.get('/logout', (req, res) => {
  res.clearCookie("remember");
  req.logout();
  res.send(req.session);
});

Router.get('/', (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log('authenticated login');
    res.json({
      token: req.session.passport.user
    });
  } else {
    if (req.cookies.remember) {
      req.headers.authorization = "JWT " + req.cookies.remember;
    } else {
      if ((req.session.passport == {})) {
        req.headers.authorization = "JWT " + req.session.passport.user;
      } else {
        res.send("Unauthorized");
      }
    }
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
          req.logIn(user, function(err) {
            if (err) {
              return next(err);
            } else {
              console.log('access token login');
              return res.json({
                token: req.session.passport.user
              });
            }
          });
        }
      })(req, res, next);
  }
});



module.exports = Router;
