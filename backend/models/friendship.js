const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'accepted'],
    default: 'pending'
  }
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

friendshipSchema.index({ user1: 1, user2: 1 })
friendshipSchema.index({ user2: 1, user1: 1 })

module.exports = mongoose.model('Friendship', friendshipSchema);