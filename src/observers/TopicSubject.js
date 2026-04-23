class TopicSubject {
  constructor() {
    this.observers = new Map();
  }

  attach(topicId, observer) {
    const key = topicId.toString();
    if (!this.observers.has(key)) {
      this.observers.set(key, new Map());
    }

    this.observers.get(key).set(observer.userId, observer);
  }

  detach(topicId, userId) {
    const key = topicId.toString();
    if (!this.observers.has(key)) {
      return;
    }

    this.observers.get(key).delete(userId.toString());
  }

  async notify(topic, message) {
    const key = topic._id.toString();
    const topicObservers = this.observers.get(key);
    if (!topicObservers) {
      return;
    }

    await Promise.allSettled(
      [...topicObservers.values()].map((observer) => observer.update(topic, message)),
    );
  }
}

module.exports = new TopicSubject();
