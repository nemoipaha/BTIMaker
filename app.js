var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config');
var routes = require('./routes');
var log = require('./logs')(module);
var bodyParser = require('body-parser');
var morgan = require('morgan');
var favicon = require('serve-favicon');
var webpack = require('webpack');
var webconf = require('./webpack.config');
var compiler = webpack(webconf);
var file = require('fs');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var errorHandler = require('errorhandler');
var router = express.Router();

app = express();

app.locals.title = config.get('title');

app.use(morgan('combined'));

app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: false,
    publicPath: webconf.output.publicPath
}));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

app.use(session({
    secret: config.get("session:secret"),
    key: config.get('session:key'),
    cookie: config.get("session:cookie"),
    store: require("./libs/sessionStore"),
    resave: true,
    saveUninitialized: false
}));

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(favicon(__dirname + '/public/favicon.png'));

app.set('view engine', 'ejs');

app.use(router);

require('./routes')(router);

app.use(function (err, req, res, next) {
    if (app.get('env') === 'development') {
      app.use(errorHandler());
      next(err);
    } else {
      res.status(500).send('Error on server');
    }
});

http.createServer(app).listen(config.get('port'), function () {
    log.info('Express server listening on port ' + config.get('port'));
});
