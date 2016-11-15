var file = require('fs');
var path = require('path');

module.exports =  function(req, res) {
  file.readFile(path.resolve(__dirname,
    '../language/' + req.params.id + '/' + req.params.type + '.json'),
    function(error, data) {
      if (error) {
        console.error("error");
        return res.json({ error: error });
      }

      data = JSON.parse(data);

      res.json(data);
    }
  );
};
