const express = require('express');
const authController = require('../controllers/authController');
const topicController = require('../controllers/topicController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', authController.showLogin);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.get('/dashboard', requireAuth, authController.dashboard);
router.post('/topics', requireAuth, topicController.createTopic);
router.get('/topics/available', requireAuth, topicController.showAvailableTopics);
router.post('/topics/:topicId/subscribe', requireAuth, topicController.subscribe);
router.post('/topics/:topicId/unsubscribe', requireAuth, topicController.unsubscribe);
router.post('/topics/:topicId/messages', requireAuth, topicController.postMessage);
router.get('/topics/stats', requireAuth, topicController.topicStats);

module.exports = router;
