const config = require('config');

const server = require('./server');
const { runWorker } = require('./worker');

const log = require('saga-logger').create({ module: module.id });

// Catch all uncaught exception, log it and then die properly
process.on('uncaughtException', err => {
  log.fatal('UNCAUGHT_EXCEPTION', err);
  process.exit(1);
});

const start = async () => {
  if (config.worker.on) {
    runWorker();
  }

  server().listen(config.app.port, '0.0.0.0', err => {
    if (err) {
      return log.error('SERVER_STARTED_FAIL', err);
    }

    log.info('SERVER_STARTED_SUCCESS', { port: config.app.port });
  });
};

start();
