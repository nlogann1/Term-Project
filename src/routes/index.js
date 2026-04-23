const express = require('express');
const authController = require('../controllers/authController');
const topicController = require('../controllers/topicController');
const { requireAuth } = require('../middleware/auth');
const { authLimiter, actionLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.get('/', authController.showLogin);
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', actionLimiter, authController.logout);

router.get('/dashboard', requireAuth, authController.dashboard);
router.post('/topics', actionLimiter, requireAuth, topicController.createTopic);
router.get('/topics/available', requireAuth, topicController.showAvailableTopics);
router.post('/topics/:topicId/subscribe', actionLimiter, requireAuth, topicController.subscribe);
router.post('/topics/:topicId/unsubscribe', actionLimiter, requireAuth, topicController.unsubscribe);
router.post('/topics/:topicId/messages', actionLimiter, requireAuth, topicController.postMessage);
router.get('/topics/stats', requireAuth, topicController.topicStats);

module.exports = router;
