const UserMessageObserver = require('../observers/UserMessageObserver');
const topicSubject = require('../observers/TopicSubject');

function attachObserver(topicId, userId) {
  topicSubject.attach(topicId, new UserMessageObserver(userId));
}

function detachObserver(topicId, userId) {
  topicSubject.detach(topicId, userId);
}

module.exports = {
  attachObserver,
  detachObserver,
  topicSubject,
};
