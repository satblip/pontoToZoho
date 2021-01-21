const h1 = 60 * 60 * 1000;

module.exports = {
  app: {
    port: process.env.APP_PORT
  },
  aws: {
    region: 'eu-west-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    invoicesBucket: process.env.AWS_INVOICES_BUCKET
  },
  ponto: {
    transactionsLimit: 30,
    clientId: process.env.PONTO_CLIENT_ID,
    clientSecret: process.env.PONTO_CLIENT_SECRET
  },
  worker: {
    on: process.env.WORKER_ON,
    processMessageThrottling: process.env.WORKER_PROCESS_MESSAGE_THROTTLING || h1
  },
  zoho: {
    authtoken: process.env.ZOHO_AUTHTOKEN,
    invoiceTemplate: process.env.ZOHO_INVOICE_TEMPLATE,
    organisationId: process.env.ZOHO_ORGANISATION_ID
  }
};
