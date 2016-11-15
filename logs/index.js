var winston = require('winston'); // for transports.Console
var EVN = process.env.NODE_ENV;

function getLogger(module){
    var path = module.filename.split('/').splice(-2).join('/');
    return new winston.Logger({
            transports:
                [
                    new winston.transports.Console(
                        {
                            colorize:true,
                            level:EVN =='development'? 'debug': 'error',
                            label:path
                        }
                    )
                ]
        }
    );
};
module.exports = getLogger;
