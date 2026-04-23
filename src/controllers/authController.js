const User = require('../models/User');
const Topic = require('../models/Topic');
const Message = require('../models/Message');
const { hashPassword, verifyPassword } = require('../utils/password');
const { attachObserver } = require('../services/subscriptionObserverService');

async function showLogin(req, res) {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }

  return res.render('login', { error: null });
}

async function register(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).render('login', { error: 'Username and password are required.' });
  }

  try {
    const user = await User.create({
      username,
      passwordHash: hashPassword(password),
      subscriptions: [],
    });

    req.session.userId = user._id.toString();
    return res.redirect('/dashboard');
  } catch (error) {
    const duplicate = error && error.code === 11000;
    return res.status(400).render('login', {
      error: duplicate ? 'Username already exists.' : 'Unable to register user.',
    });
  }
}

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).render('login', { error: 'Username and password are required.' });
  }

  const user = await User.findOne({ username }).populate('subscriptions');
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).render('login', { error: 'Invalid credentials.' });
  }

  req.session.userId = user._id.toString();

  for (const subscription of user.subscriptions) {
    attachObserver(subscription._id, user._id);
  }

  return res.redirect('/dashboard');
}

async function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/');
  });
}

async function dashboard(req, res) {
  const user = await User.findById(req.session.userId)
    .populate({
      path: 'subscriptions',
      options: { sort: { createdAt: -1 } },
    });

  if (!user) {
    return res.redirect('/');
  }

  const subscribedTopicIds = user.subscriptions.map((topic) => topic._id);

  const messageGroups = await Promise.all(
    user.subscriptions.map(async (topic) => {
      const messages = await Message.find({ topic: topic._id })
        .sort({ createdAt: -1 })
        .limit(2)
        .populate('author');

      return {
        topic,
        messages,
      };
    }),
  );

  if (subscribedTopicIds.length > 0) {
    await Topic.updateMany(
      { _id: { $in: subscribedTopicIds } },
      { $inc: { accessCount: 1 } },
    );
  }

  return res.render('dashboard', {
    username: user.username,
    messageGroups,
  });
}

module.exports = {
  showLogin,
  register,
  login,
  logout,
  dashboard,
};
