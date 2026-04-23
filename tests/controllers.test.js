const authController = require('../src/controllers/authController');
const topicController = require('../src/controllers/topicController');

jest.mock('../src/models/User', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../src/models/Topic', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  updateMany: jest.fn(),
}));

jest.mock('../src/models/Message', () => ({
  find: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../src/services/subscriptionObserverService', () => ({
  attachObserver: jest.fn(),
  detachObserver: jest.fn(),
  topicSubject: {
    notify: jest.fn(),
  },
}));

const User = require('../src/models/User');
const Topic = require('../src/models/Topic');
const Message = require('../src/models/Message');
const { attachObserver, topicSubject } = require('../src/services/subscriptionObserverService');

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    render: jest.fn().mockReturnThis(),
  };
}

describe('topicController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createTopic auto-subscribes creator and attaches observer', async () => {
    Topic.create.mockResolvedValue({ _id: 'topic-1' });
    User.findByIdAndUpdate.mockResolvedValue({});

    const req = { body: { name: 'General' }, session: { userId: 'user-1' } };
    const res = createMockRes();

    await topicController.createTopic(req, res);

    expect(Topic.create).toHaveBeenCalledWith({
      name: 'General',
      creator: 'user-1',
      subscribers: ['user-1'],
    });
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user-1', { $addToSet: { subscriptions: 'topic-1' } });
    expect(attachObserver).toHaveBeenCalledWith('topic-1', 'user-1');
    expect(res.redirect).toHaveBeenCalledWith('/dashboard');
  });

  test('postMessage requires subscription', async () => {
    User.findById.mockResolvedValue({ subscriptions: ['other-topic'] });

    const req = {
      params: { topicId: 'topic-1' },
      session: { userId: 'user-1' },
      body: { content: 'hello' },
    };
    const res = createMockRes();

    await topicController.postMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('User must be subscribed to post in this topic.');
  });

  test('postMessage notifies observers for subscribed users', async () => {
    User.findById.mockResolvedValue({ subscriptions: ['topic-1'] });
    Topic.findById.mockResolvedValue({ _id: 'topic-1' });
    Message.create.mockResolvedValue({ _id: 'msg-1' });

    const req = {
      params: { topicId: 'topic-1' },
      session: { userId: 'user-1' },
      body: { content: 'hello' },
    };
    const res = createMockRes();

    await topicController.postMessage(req, res);

    expect(Message.create).toHaveBeenCalledWith({ topic: 'topic-1', author: 'user-1', content: 'hello' });
    expect(topicSubject.notify).toHaveBeenCalledWith({ _id: 'topic-1' }, { _id: 'msg-1' });
    expect(res.redirect).toHaveBeenCalledWith('/dashboard');
  });
});

describe('authController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('dashboard renders only two most recent messages per subscribed topic and increments access count', async () => {
    const subscription = { _id: 'topic-1', name: 'General' };
    const user = { username: 'alice', subscriptions: [subscription] };

    User.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(user),
    });

    Message.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([
            { content: 'newest', author: { username: 'a' } },
            { content: 'older', author: { username: 'b' } },
          ]),
        }),
      }),
    });

    Topic.updateMany.mockResolvedValue({});

    const req = { session: { userId: 'user-1' } };
    const res = createMockRes();

    await authController.dashboard(req, res);

    expect(Topic.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ['topic-1'] } },
      { $inc: { accessCount: 1 } },
    );
    expect(res.render).toHaveBeenCalledWith('dashboard', {
      username: 'alice',
      messageGroups: [
        {
          topic: subscription,
          messages: [
            { content: 'newest', author: { username: 'a' } },
            { content: 'older', author: { username: 'b' } },
          ],
        },
      ],
    });
  });
});
