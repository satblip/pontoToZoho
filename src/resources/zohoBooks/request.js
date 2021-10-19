const rp = require('request-promise');
const config = require('config');

module.exports.getAuthToken = async () => {
  return rp({
    method: 'POST',
    uri: 'https://accounts.zoho.com/oauth/v2/token',
    qs: {
      refresh_token: config.zoho.refreshToken,
      client_id: config.zoho.clientId,
      client_secret: config.zoho.clientSecret,
      redirect_uri: 'http://localhost:19101/callback',
      grant_type: 'refresh_token'
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    json: true
  });
};

module.exports.zohoRequest = async (accessToken, method, path, values = {}) => {
  const requestOptions = {
    method,
    uri: `https://books.zoho.com/api/v3/${path}`,
    qs: {
      organization_id: config.zoho.organisationId
    },
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`
    },
    json: true
  };

  if (values.id) {
    requestOptions.uri = `${requestOptions.uri}/${values.id}`;
  }

  if (values.search) {
    requestOptions.qs.search_text = values.search;
  }

  if (values.searchTransaction) {
    requestOptions.qs.reference_number = values.searchTransaction.referenceNumber;
    requestOptions.qs.account_id = values.searchTransaction.accountId;
    if (values.searchTransaction.status) {
      requestOptions.qs.status = values.searchTransaction.status;
    }
  }

  if (values.pdf) {
    requestOptions.qs.accept = 'pdf';
    requestOptions.encoding = null;
    requestOptions.headers['Content-type'] = 'application/pdf';
  }

  if (method === 'POST') {
    requestOptions.form = {
      JSONString: JSON.stringify(values)
    };
  }

  return rp(requestOptions);
};
