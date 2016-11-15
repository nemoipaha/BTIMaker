var crypto = require('crypto');
var mongoose = require('../libs/mongoose');
var async = require('async');
var AuthError = require("../error").AuthError;
var DbError = require("../error").DbError;
var log = require('../logs')(module);

var schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now()
  },
  projects: [
    {
      name: String,
      date: {
        type: Date,
        default: Date.now()
      },
      options: {},
      objects: {}
    }
  ],
  ip: String
});

schema.methods.encryptPass = function (pass) {
  return crypto.createHmac('sha1', this.salt).update(pass).digest('hex');
};

schema.virtual('password')
  .set(function (pass) {
    this._plainPassword = pass;
    this.salt = Math.random() + '';
    this.hashedPassword = this.encryptPass(pass);
  })
  .get(function () {
    return this._plainPassword;
  });

schema.methods.checkPassword = function (pass) {
  return this.encryptPass(pass) === this.hashedPassword;
};

schema.statics.deleteProjects = function (userId, indexes, callback) {
  var User = this;
  User.findById(userId, function (err, user) {
    if (err) return callback(new DbError(err.msg));
    if (user) {
      indexes.forEach((ind, i) => {
        user.projects.splice(ind, 1);
      });
    }
    User.findByIdAndUpdate(userId, { projects: user.projects }, function (err, user) {
      if (err) return callback(new DbError('cant update user info'));
      return callback(null, user);
    });
  });
};

schema.statics.updateProjects = function (userId, projects, callback) {
  var User = this;
  //console.log(projects);
  User.findById(userId, function (err, user) {
    if (err) return callback(new DbError(err.msg));
    if (user) {
      if (user.projects.length) {
        var arr = projects;
        user.projects.forEach((item, i) => {
          arr.forEach((elem) => {
            if (item.name == elem.name) {
              elem.index = i;
              elem.isRepeat = true;
              return;
            }
          });
        });
        //console.log(arr);
        arr.forEach((item, i) => {
          if (item.isRepeat) {
            delete item.isRepeat;
            var ind = item.index;
            delete item.index;
            user.projects[ind] = projects[i];
          } else {
            user.projects.push(projects[i]);
          }
        });
        //console.log(user.projects);
      } else user.projects = projects;
    }
    User.findByIdAndUpdate(userId, { projects: user.projects }, function (err, user) {
      if (err) return callback(new DbError('cant update user info'));
      return callback(null, user);
    });
  });
};

schema.statics.deleteAllProjects = function (userId, callback) {
  var User = this;
  User.findByIdAndUpdate(userId, { projects: [] }, function (err, user) {
    if (err) return callback(new DbError('cant update user info'));
    return callback(null, user);
  });
};

schema.statics.deleteProject = function (userId, projectId, callback) {
  var User = this;
  console.log(projectId);
  User.findByIdAndUpdate(userId, { $pull: { projects: { _id: projectId } } },
    function (err, user) {
      if (err) return callback(new DbError('cant update user info'));
      if (user) return callback(null, user);
      else return callback(new DbError('aaa'));
    });
};

schema.statics.authorize = function (username, password, isAuth, ip, callback) {
  var User = this;

  async.waterfall([
    function (callback) {
      User.findOne({ username: username }, callback);
    },
    function (user, callback) {
      if (user) {
        // если юзер сущес-т и мы авторизируеся
        if (isAuth) {
          if (user.checkPassword(password)) {
            callback(null, user);
          } else {
            callback(new AuthError("wrong password"));
          }
        }
        // если юзер суще-т, но кто-то проходит регистрацию с таким же логином
        else {
          callback(new AuthError("user exists"));
        }
      }
      // если юзера нет и кто-то проходит авторизацию
      else if (isAuth) {
        callback(new AuthError("user doesn`t exists"));
      }
      // наконец если юзера нет, но идет регис-я, то сохраняем нового юзера
      else {
        log.info('save user');

        var user = new User({ username: username, password: password, ip: ip });

        user.save(function (err) {

          if (err) return callback(err);

          callback(null, user);
        });
      }
    }
  ], callback);
};

module.exports.User = mongoose.model('User', schema);


