const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
