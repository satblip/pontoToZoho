const ponto = require('../resources/ponto');
const {
  asyncForEach
} = require('../helpers/asyncForEach');

const zohoBooks = require('../resources/zohoBooks');

const moment = require('moment-timezone');

const log = require('saga-logger').create({
  module: module.id
});

module.exports.create = async params => {
  const matchPontoToZoho = JSON.parse(
    process.env.MATCH_PONTO_ZOHO.replace(/'/g, '').replace(/\\/g, '')
  );

  log.debug('STARTED', {
    accounts: matchPontoToZoho
  });

  await asyncForEach(Object.keys(matchPontoToZoho), async (pontoAccount) => {
    const zohoAccount = matchPontoToZoho[pontoAccount];

    try {
      log.debug('REFRESH_ACCOUNT', {
        zohoAccount: zohoAccount,
        pontoAccount: pontoAccount
      });
      const synchronisation = await ponto.refreshAccount(pontoAccount);

      log.debug('SYNCHRONIZE_ACCOUNT', {
        zohoAccount: zohoAccount,
        pontoAccount: pontoAccount
      });
      await ponto.waitForSynchronisation(synchronisation.data.id);
    } catch (error) {
      if (!error.message.includes('accountRecentlySynchronized')) {
        throw error;
      };
    }

    log.debug('GET_TRANSACTIONS', {
      zohoAccount: zohoAccount,
      pontoAccount: pontoAccount
    });
    const transactions = await ponto.getTransactions(pontoAccount);

    const transactionsDates = [];

    const zohoStatementImport = {
      account_id: zohoAccount,
      transactions: []
    };

    const authToken = await zohoBooks.getAuthToken();

    await asyncForEach(transactions.data, async (transaction) => {
      const existingZohoTransaction = await zohoBooks
        .getTransactionsbyReferenceAndAccountId(authToken.access_token, transaction.id, zohoAccount);

      const existingUncategorizedZohoTransaction = await zohoBooks
        .getTransactionsbyReferenceAndAccountId(authToken.access_token, transaction.id, zohoAccount, 'uncategorized');

      if (!existingZohoTransaction.banktransactions.length && !existingUncategorizedZohoTransaction.banktransactions.length) {
        let transactionType = null;

        if (transaction.attributes.amount > 0) {
          transactionType = 'credit';
        } else {
          transactionType = 'credit';
        }

        const valueDate = moment(transaction.attributes.valueDate).tz('Europe/Brussels');

        transactionsDates.push(valueDate);

        const zohoTransactionToStatement = {
          date: valueDate.format('YYYY-MM-DD'),
          debit_or_credit: transactionType,
          amount: transaction.attributes.amount,
          payee: transaction.attributes.counterpartName,
          description: `${transaction.attributes.remittanceInformationType}: ${transaction.attributes.remittanceInformation}`,
          reference_number: transaction.id
        };

        zohoStatementImport.transactions.push(zohoTransactionToStatement);
      }
    });

    zohoStatementImport.start_date = moment.min(transactionsDates).format('YYYY-MM-DD');
    zohoStatementImport.end_date = moment.max(transactionsDates).format('YYYY-MM-DD');

    if (zohoStatementImport.transactions.length) {
      await zohoBooks.createStatement(authToken.access_token, zohoStatementImport);
      log.debug('STATEMENT_CREATED', zohoStatementImport);
    }
  });

  return {
    sucess: true
  };
};
