const Notification = require('../models/Notification');
const TopicObserver = require('./TopicObserver');

class UserMessageObserver extends TopicObserver {
  constructor(userId) {
    super();
    this.userId = userId.toString();
  }

  async update(topic, message) {
    await Notification.create({
      user: this.userId,
      topic: topic._id,
      message: message._id,
    });
  }
}

module.exports = UserMessageObserver;
