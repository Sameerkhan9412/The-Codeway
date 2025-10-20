const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const {userMiddleware} = require('../middleware/userMiddleware');

// Get all discussions with filtering and pagination
router.get('/', discussionController.getDiscussions);

// Get a single discussion by ID with comments
router.get('/:id', discussionController.getDiscussionById);

// Get comments for a discussion
router.get('/:discussionId/comments', discussionController.getComments);

// Protected routes (require authentication)
router.use(userMiddleware);

// Create a new discussion
router.post('/', discussionController.createDiscussion);

// Update a discussion
router.put('/:id', discussionController.updateDiscussion);

// Delete a discussion
router.delete('/:id', discussionController.deleteDiscussion);

// Add a comment to a discussion
router.post('/:discussionId/comments', discussionController.addComment);

// Update a comment
router.put('/comments/:commentId', discussionController.updateComment);

// Delete a comment
router.delete('/comments/:commentId', discussionController.deleteComment);

// Vote on a discussion
router.post('/:id/vote', userMiddleware, discussionController.voteDiscussion);

// Vote on a comment
router.post('/comments/:commentId/vote', userMiddleware, discussionController.voteComment);

module.exports = router;