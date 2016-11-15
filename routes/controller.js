var file = require('fs');

module.exports = function(req, res) {
  file.readFile('./public/javascripts/controller.js', function(error, data) {
    if (error) throw error;
    res.send(data);
  });
};
