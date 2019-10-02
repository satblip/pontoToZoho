const { expect } = require('chai');
const { read } = require('controllers/healthcheck');

const { name, version } = require('../../package.json');

describe('Controller healthcheck', () => {
  it('should send the name and the package version', async () => {
    const expected = {
      name,
      version
    };
    const actual = await read();

    expect(actual.name).to.equal(expected.name);
    expect(actual.version).to.equal(expected.version);
    expect(actual).to.have.property('buildNumber');
  });
});
