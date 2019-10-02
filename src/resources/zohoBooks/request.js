const rp = require('request-promise');
const config = require('config');

module.exports.zohoRequest = async (method, path, values = {}) => {
  const requestOptions = {
    method,
    uri: `https://books.zoho.com/api/v3/${path}`,
    qs: {
      authtoken: config.zoho.authtoken
    },
    headers: [],
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
