const mongoose = require('mongoose');

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.connected = false;
    Database.instance = this;
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(uri) {
    if (this.connected) {
      return mongoose.connection;
    }

    const mongoUri = uri || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/term-project';
    await mongoose.connect(mongoUri);
    this.connected = true;
    return mongoose.connection;
  }

  async disconnect() {
    if (!this.connected) {
      return;
    }

    await mongoose.disconnect();
    this.connected = false;
  }
}

module.exports = Database;
