const express = require('express');
const path = require('path');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { csrfProtection, attachCsrfToken } = require('./middleware/csrf');

const app = express();

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));

const MongoStore = (typeof connectMongo.create === 'function')
  ? connectMongo
  : connectMongo(session);

const sessionStore = (typeof MongoStore.create === 'function')
  ? MongoStore.create({ mongoUrl: process.env.MONGO_URI }) // v4+
  : new MongoStore({ url: process.env.MONGO_URI });        // v3

app.use(session({
  secret: process.env.SESSION_SECRET || 'term-project-secret',
  resave: false,
  saveUninitialized: true,
  proxy: true,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60,
  },
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(csrfProtection);
app.use(attachCsrfToken);

app.use(routes);

module.exports = app;
