const express = require('express');
const Playlist = require('../models/playlist');
const {userMiddleware} = require('../middleware/userMiddleware');
const playlistRouter = express.Router();


// Create a new playlist
// Create playlist
playlistRouter.post('/', userMiddleware, async (req, res) => {
  try {
    const playlist = new Playlist({
      name: req.body.name,
      user: req.result._id,
      problems: []
    });
    await playlist.save();
    res.status(201).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Failed to create playlist',
      error: err.message
    });
  }
});

// Add problem to playlist
playlistRouter.post('/:id/problems', userMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.result._id,
        problems: { $ne: req.body.problemId } // Only add if not already present
      },
      {
        $addToSet: { problems: req.body.problemId }
      },
      { new: true }
    ).populate('problems');

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found or problem already exists in playlist'
      });
    }

    res.status(200).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Failed to add problem to playlist',
      error: err.message
    });
  }
});

// Get user playlists
playlistRouter.get('/user', userMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.result._id })
      .populate({
        path: 'problems',
        select: 'title difficulty tags'
      });
      
    res.status(200).json({
      success: true,
      data: playlists
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch playlists',
      error: err.message
    });
  }
});

playlistRouter.post('/:id/problems', userMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.result._id,
        problems: { $ne: req.body.problemId }
      },
      {
        $addToSet: { problems: req.body.problemId }
      },
      { new: true }
    ).populate({
      path: 'problems',
      select: 'title difficulty tags acceptance description'
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found or problem already exists in playlist'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: playlist._id,
        name: playlist.name,
        user: playlist.user,
        problems: playlist.problems.map(p => ({
          _id: p._id,
          title: p.title,
          difficulty: p.difficulty,
          tags: p.tags,
          acceptance: p.acceptance,
          description: p.description
        }))
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Failed to add problem to playlist',
      error: err.message
    });
  }
});

playlistRouter.get('/:id', userMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user: req.result._id
    }).populate({
      path: 'problems',
      select: 'title difficulty tags acceptance description'
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    res.status(200).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch playlist',
      error: err.message
    });
  }
});

// Remove problem from playlist
playlistRouter.delete('/:playlistId/problems/:problemId', userMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndUpdate(
      {
        _id: req.params.playlistId,
        user: req.result._id
      },
      {
        $pull: { problems: req.params.problemId }
      },
      { new: true }
    ).populate('problems');

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found or you dont have permission'
      });
    }

    res.status(200).json({
      success: true,
      data: playlist,
      message: 'Problem removed from playlist'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Failed to remove problem from playlist',
      error: err.message
    });
  }
});

playlistRouter.delete('/:id', userMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      user: req.result._id
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found or you do not have permission to delete'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Playlist deleted successfully'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete playlist',
      error: err.message
    });
  }
});

module.exports = playlistRouter;
