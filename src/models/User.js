const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  subscriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
