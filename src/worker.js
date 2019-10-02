const config = require('config');
const pontoToZoho = require('./controllers/pontoToZoho');
const log = require('saga-logger').create({ module: module.id });

const runWorker = async () => {
  log.debug('WORKER_RUN');

  try {
    const pontoImport = await pontoToZoho.create();
    log.info('WORKER_RUN_SUCCESS', pontoImport);
    setTimeout(runWorker, config.worker.processMessageThrottling);
  } catch (error) {
    log.error('WORKER_RUN_FAIL', error, { validations: error.validations });
    setTimeout(runWorker, config.worker.processMessageThrottling);
  }
};

module.exports = {
  runWorker
};
