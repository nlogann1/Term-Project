# Term-Project

A simplified message exchanging service (Tweeter/message-board style) built with Node.js, Express, MongoDB (Mongoose), and EJS.

## Implemented requirements

- Topic threads are maintained by the system
- User registration/login
- Topic creation with automatic subscription for the creator
- Topic subscription and unsubscription
- Message posting only in subscribed topics
- Dashboard shows the 2 most recent messages per subscribed topic
- Dashboard includes link to available topics for subscription and unsubscribe controls per subscribed topic
- MVC architecture (models/controllers/views)
- Observer pattern (topic subject notifies user observers when new messages are posted)
- Singleton pattern for database access
- Topic access statistics tracking and reporting

## Run

```bash
npm install
npm start
```

## Test

```bash
npm test
```
