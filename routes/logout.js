var log = require('../logs')(module);
var config = require('../config');

module.exports = function(req, res, next) {
  // если есть юзер
  if (req.session.user) {
    req.session.user = null;
    //log.info(config.get('session:key'));
    res.clearCookie(config.get('session:key'), {});
    return res.json({ success: true });
  }
  return res.json({ success: false });
};