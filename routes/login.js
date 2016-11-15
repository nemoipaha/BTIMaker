var User = require("../models/user").User;
var config = require('../config');
var log = require('../logs')(module);
var mongoose = require('../libs/mongoose');

module.exports = function(req, res, next) {
  if (!mongoose.isConn) {
    res.json({ user: false });
    return;
  }

  // если есть юзер
  if (req.session.user) {
    res.json({ error: 'you are currently login' });
    return;
  }

  var username = req.body.username;
  var password = req.body.password;
  var isAuth = req.body.isAuth === 'true';
  var stayLogin = req.body.stayLogin === 'true';
  var ip = req.ip;

  User.authorize(username, password, isAuth, ip, function (err, user) {
    if (err) {
      return res.json({ error: err });
    }
    if (user) {
      //log.info(user);
      req.session.user = user._id;
      if (stayLogin) {
        req.session.cookie.expires = new Date(Date.now() + parseInt(config.get('cookieExpires')));
      }
      var data = {
        username: user.username,
        created: user.created,
        ip: user.ip, projects:
        user.projects
      };
      res.json({ user: data });
    } else {
      log.info('no user');
      res.json({ user: false });
    }
  });
};