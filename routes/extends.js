var file = require('fs');

module.exports = function(req, res) {
  file.readFile('./public/javascripts/base-extends.js',
    function(error, data) {
      if (error) throw error;
      console.log(data);
      res.send(data);
    });
};
