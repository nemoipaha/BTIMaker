var mongoose = require('mongoose');
var config = require("../config");
var log = require('../logs')(module);

mongoose.connect(config.get("mongoose:uri"), config.get("mongoose:options"));

var db = mongoose.connection;

db.on('error', function (err) {
  mongoose.isConn = false;
 // mongoose.isConn = true;
  log.error('db connection error:', err.message);
});

db.once('open', function callback () {
  mongoose.isConn = true;
  log.info("Connected to DB!");
});

module.exports = mongoose;