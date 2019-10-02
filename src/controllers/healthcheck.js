const packageJson = require('../../package.json');

module.exports.read = async params => {
  return {
    name: packageJson.name,
    version: packageJson.version,
    buildNumber: process.env.BUILD_NUMBER
  };
};
