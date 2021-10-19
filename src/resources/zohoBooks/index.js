const {
  zohoRequest,
  getAuthToken
} = require('./request');

module.exports.getTransactionsbyReferenceAndAccountId = async (accessToken, referenceNumber, accountId, status) => {
  return zohoRequest(accessToken, 'GET', 'banktransactions', {
    searchTransaction: {
      referenceNumber,
      accountId,
      status
    }
  });
};

module.exports.createStatement = async (accessToken, statementImport) => {
  return zohoRequest(accessToken, 'POST', 'bankstatements', statementImport);
};

module.exports.getAuthToken = getAuthToken;
