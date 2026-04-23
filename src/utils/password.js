const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, originalHash] = stored.split(':');
  if (!salt || !originalHash) {
    return false;
  }

  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(hash, 'hex'));
}

module.exports = {
  hashPassword,
  verifyPassword,
};
