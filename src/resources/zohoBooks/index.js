const {
  zohoRequest
} = require('./request');

module.exports.getTransactionsbyReferenceAndAccountId = async (referenceNumber, accountId, status) => {
  return zohoRequest('GET', 'banktransactions', {
    searchTransaction: {
      referenceNumber,
      accountId,
      status
    }
  });
};

module.exports.createStatement = async (statementImport) => {
  return zohoRequest('POST', 'bankstatements', statementImport);
};
