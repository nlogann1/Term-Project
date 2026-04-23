const User = require('../models/User');
const Topic = require('../models/Topic');
const Message = require('../models/Message');
const { attachObserver, detachObserver, topicSubject } = require('../services/subscriptionObserverService');

async function createTopic(req, res) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send('Topic name is required.');
  }

  try {
    const topic = await Topic.create({
      name,
      creator: req.session.userId,
      subscribers: [req.session.userId],
    });

    await User.findByIdAndUpdate(
      req.session.userId,
      { $addToSet: { subscriptions: topic._id } },
    );

    attachObserver(topic._id, req.session.userId);

    return res.redirect('/dashboard');
  } catch (error) {
    const duplicate = error && error.code === 11000;
    return res.status(400).send(duplicate ? 'Topic already exists.' : 'Unable to create topic.');
  }
}

async function showAvailableTopics(req, res) {
  const user = await User.findById(req.session.userId);
  if (!user) {
    return res.redirect('/');
  }

  const topics = await Topic.find({ _id: { $nin: user.subscriptions } }).sort({ createdAt: -1 });

  return res.render('available-topics', { topics });
}

async function subscribe(req, res) {
  const topicId = req.params.topicId;

  await User.findByIdAndUpdate(
    req.session.userId,
    { $addToSet: { subscriptions: topicId } },
  );

  await Topic.findByIdAndUpdate(
    topicId,
    { $addToSet: { subscribers: req.session.userId } },
  );

  attachObserver(topicId, req.session.userId);

  return res.redirect('/dashboard');
}

async function unsubscribe(req, res) {
  const topicId = req.params.topicId;

  await User.findByIdAndUpdate(
    req.session.userId,
    { $pull: { subscriptions: topicId } },
  );

  await Topic.findByIdAndUpdate(
    topicId,
    { $pull: { subscribers: req.session.userId } },
  );

  detachObserver(topicId, req.session.userId);

  return res.redirect('/dashboard');
}

async function postMessage(req, res) {
  const topicId = req.params.topicId;
  const { content } = req.body;

  if (!content) {
    return res.status(400).send('Message content is required.');
  }

  const user = await User.findById(req.session.userId);
  if (!user || !user.subscriptions.some((id) => id.toString() === topicId)) {
    return res.status(403).send('User must be subscribed to post in this topic.');
  }

  const topic = await Topic.findById(topicId);
  if (!topic) {
    return res.status(404).send('Topic not found.');
  }

  const message = await Message.create({
    topic: topicId,
    author: req.session.userId,
    content,
  });

  await topicSubject.notify(topic, message);

  return res.redirect('/dashboard');
}

async function topicStats(req, res) {
  const topics = await Topic.find({}).sort({ accessCount: -1, name: 1 });
  return res.render('topic-stats', { topics });
}

module.exports = {
  createTopic,
  showAvailableTopics,
  subscribe,
  unsubscribe,
  postMessage,
  topicStats,
};
