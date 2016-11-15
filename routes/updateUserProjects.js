var User = require("../models/user").User;
var log = require('../logs')(module);
var mongoose = require('../libs/mongoose');

module.exports = function(req, res, next) {
  if (!mongoose.isConn || !req.session.user) {
    res.json({ success: false });
    return;
  }
  //console.log(req.body.data);
  User.updateProjects(req.session.user, req.body.data, function (err) {
    if (err) {
      return res.json({ error: err });
    }
    return res.json({ success: true });
  });
};