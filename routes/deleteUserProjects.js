var User = require("../models/user").User;
var log = require('../logs')(module);
var mongoose = require('../libs/mongoose');

module.exports = function(req, res, next) {
  if (!mongoose.isConn || !req.session.user) {
    res.json({ success: false });
    return;
  }
  if (req.body.projectId) {
    User.deleteProject(req.session.user, req.body.projectId, function (err, user) {
      if (err) {
        return res.json({ error: err });
      }
      console.log(user);
      return res.json({ success: true, user: user });
    });
  }
  else if (req.body.indexes && req.body.indexes.length) {
    User.deleteProjects(req.session.user, req.body.indexes, function (err, user) {
      if (err) {
        return res.json({ error: err });
      }
      return res.json({ success: true, user: user });
    });
  }
  else if (req.body.deleteAll) {
    User.deleteAllProjects(req.session.user, function (err, user) {
      if (err) {
        return res.json({ error: err });
      }
      return res.json({ success: true, user: user });
    });
  }
  //console.log(req.body.data);
  else res.json({ error: new Error('Error') });
};