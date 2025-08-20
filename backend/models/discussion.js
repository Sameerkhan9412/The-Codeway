const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  community: {
    type: String,
    enum: ['dsa', 'global', 'india', 'other', "general" ],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add text index for search on title and content
discussionSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Discussion', discussionSchema);
