class TopicObserver {
  async update() {
    throw new Error('Observer update method must be implemented.');
  }
}

module.exports = TopicObserver;
