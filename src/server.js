const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const ManagedError = require('saga-managed-error');

const { Barabara } = require('barabara');

const log = require('saga-logger').create({
  module: module.id
});

module.exports = () => {
  log.debug('ROUTER_LOADING');
  const app = express();

  const autoroute = new Barabara(
    express.Router,
    {
      read: 'get',
      create: 'post',
      update: 'put',
      destroy: 'delete'
    }
  );

  app.use(
    bodyParser.json({
      strict: true,
      limit: '200mb'
    })
  );

  app.enable('trust proxy');

  const autorouter = autoroute.createRouter(path.join(__dirname, 'controllers'));

  app.use('/', autorouter);

  app.all('*', (req, res, next) => {
    next(new ManagedError('API_GENERAL', 404));
  });

  // Error Handler (the 4 arguments are required!)
  app.use((error, req, res, next) => { // NOSONAR
    const statusCode = error.statusCode || 500;
    const data = {
      error: error.message
    };

    if (error.validations) {
      data.validations = error.validations;
    }

    const meta = _.pick(req, ['method', 'path', 'query', 'body']);

    log.error('API_FAIL', error, meta);
    res.status(statusCode).json(data);
  });

  return app;
};
