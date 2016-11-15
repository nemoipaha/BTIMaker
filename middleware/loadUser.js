var User = require("../models/user").User;
var config = require('../config');
var log = require('../logs')(module);
var mongoose = require('../libs/mongoose');
var DbError = require('../error').DbError;

module.exports = function (req, res, next) {
  req.user = null;
/*
  if (!mongoose.isConn) {
    return next(new DbError('Error db connect'));
  }*/

  if (!req.session.user) {
    log.info('not user session');
    res.clearCookie(config.get('session:key'), {});
    return next();
  }

  User.findById(req.session.user, function (err, user) {
    if (err) {
      log.info(err);
      return next(err);
    }

    //console.log(user);

    if (!user) {
      log.info('no user in db');
      req.session.user = null;
      res.clearCookie(config.get('session:key'), {});
    } else {
      req.user = user;
      log.info('user exists');
    }

    next();
  });
};


