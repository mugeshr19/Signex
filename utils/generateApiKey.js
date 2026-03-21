const crypto = require('crypto');

const generateApiKey = () => {
  return 'Sign_' + crypto.randomBytes(24).toString('hex');
};

module.exports = generateApiKey;