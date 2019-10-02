const BPromise = require('bluebird');
const config = require('config');
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
  correctClockSkew: true
});

module.exports.s3 = new AWS.S3();
