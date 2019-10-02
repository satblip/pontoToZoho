const rp = require('request-promise');

const config = require('config');

const getAuthenticationToken = async () => {
  const basicAuth = Buffer.from(`${config.ponto.clientId}:${config.ponto.clientSecret}`).toString('base64')
  const requestOptions = {
    method: 'POST',
    body: 'grant_type=client_credentials',
    uri: `https://api.myponto.com/oauth2/token`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`
    },
    json: true
  };

  const response = await rp(requestOptions);

  return response.access_token;
};

const pontoRequest = async (method, path, body) => {
  const accessToken = await getAuthenticationToken();

  const requestOptions = {
    method,
    body,
    uri: `https://api.myponto.com/${path}`,
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    json: true
  };

  return rp(requestOptions);
};

module.exports.getBanks = async () => {
  return pontoRequest('GET', 'financial-institutions');
};

module.exports.getAccounts = async () => {
  return pontoRequest('GET', 'accounts');
};

module.exports.refreshAccount = async (accountId) => {
  const body = {
    data: {
      type: 'synchronization',
      attributes: {
        resourceType: 'account',
        resourceId: accountId,
        subtype: 'accountTransactions'
      }
    }
  };
  return pontoRequest('POST', `synchronizations`, body);
};

const sleep = (milliseconds) => {
  const start = new Date().getTime();
  for (let i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
};
const checkSynchronisationSucces = async (synchronisationId) => {
  const synchronisation = await pontoRequest('GET', `synchronizations/${synchronisationId}`);

  if (synchronisation.data.attributes.status === 'success') {
    return true;
  }

  return false;
};

module.exports.waitForSynchronisation = async (synchronisationId) => {
  while (true) {
    if (await checkSynchronisationSucces(synchronisationId)) {
      return true;
    } else {
      sleep(2000);
    }
  }
};

module.exports.getTransactions = async (accountId) => {
  const transactionsLimit = config.ponto.transactionsLimit;
  return pontoRequest('GET', `accounts/${accountId}/transactions?limit=${transactionsLimit}`);
};

