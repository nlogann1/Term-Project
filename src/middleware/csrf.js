const crypto = require('crypto');

function ensureToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  return req.session.csrfToken;
}

function attachCsrfToken(req, res, next) {
  res.locals.csrfToken = ensureToken(req);
  next();
}

function csrfProtection(req, res, next) {
  const method = req.method.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return next();
  }

  const token = req.body?._csrf || req.get('x-csrf-token');
  const sessionToken = ensureToken(req);

  if (!token || token !== sessionToken) {
    return res.status(403).send('Invalid CSRF token.');
  }

  return next();
}

module.exports = {
  attachCsrfToken,
  csrfProtection,
};
