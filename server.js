const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const Ddos = require('ddos');
const ExpressLogs = require('express-server-logs');
const routes = require('./v1/router');
const error = require('./middlewares/error');
const {
  whitelist, ddosConfig,
} = require('./config');

const ddosInstance = new Ddos(ddosConfig);

// const corsOptions = {
//   exposedHeaders: 'authorization, x-refresh-token, x-token-expiry-time',
//   origin: (origin, callback) => {
//     if (!whitelist || whitelist.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };

/**
 * Express instance
 * @public
 */

const server = express();
const xlogs = new ExpressLogs(false);

server.use(express.static(__dirname + '/uploads'));

// npm module for preventing ddos attack. See more https://www.npmjs.com/package/ddos
server.use(ddosInstance.express);

// parse body params and attache them to req.body
server.use(bodyParser.json());
// server.use(bodyParser.urlencoded({ extended: true }));

// server.use(xlogs.logger);

// secure servers by setting various HTTP headers
server.use(helmet());

// enable CORS - Cross Origin Resource Sharing
server.use(cors());

// mount api v1 routes
server.use('/v1', routes);

// if error is not an instanceOf APIError, convert it.
server.use(error.converter);

// catch 404 and forward to error handler
server.use(error.notFound);

// error handler, send stacktrace only during development
server.use(error.handler);

module.exports = server;
