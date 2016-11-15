var User = require("../models/user").User;
var config = require('../config');
var log = require('../logs')(module);

module.exports = function (req, res, next) {
  if (!req.session.user) {
    log.info('not user session');
    res.clearCookie(config.get('session:key'), {});
    return res.json({ user: null });
  }

  User.findById(req.session.user, function (err, user) {
    if (err) {
      log.info(err);
      return res.json(err);
    }

    if (!user) {
      log.info('no user in db');
      req.session.user = null;
      res.clearCookie(config.get('session:key'), {});
      return res.json(null);
    }

    var data = {
      username: user.username,
      created: user.created,
      ip: user.ip,
      projects: user.projects
    };

    res.json({ user: data });
  });
};


