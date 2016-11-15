var file = require('fs');
var path = require("path");

module.exports = function(req, res) {
  var body = req['body'];
  file.readFile(path.resolve(__dirname, '../options/'+body['type']+'/'+body['data']+'.json'),
    function(error, data) {
      if (error) return res.json({ error: error });
      data = JSON.parse(data);
      if (body['data'] == 'objects') {
        res.send({
          attrs: data,
          dir: 'javascripts/elements/'
        });
      } else {
        res.setHeader('Cache-Control', 'no-cache');
        res.json(data);
      }
    }
  );
};
