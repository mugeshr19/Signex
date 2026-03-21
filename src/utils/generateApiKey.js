const crypto = require('crypto');

const generateApiKey = () => {
  return 'Sign_' + crypto.randomBytes(16).toString('hex');
};

module.exports = generateApiKey;