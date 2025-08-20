const Problem = require("../models/problem");
const SolutionVideo = require("../models/solutionVideo");
const User = require("../models/user");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.result._id;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;

    const uploadParams = {
      timestamp,
      public_id: publicId,
    };

    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });
  } catch (error) {
    console.error("Error generating upload signature:", error);
    res.status(500).json({ error: "Failed to generate upload credentials" });
  }
};


const saveVideoMetadata = async (req, res) => {
  try {
    const { problemId, cloudinaryPublicId, secureUrl, duration, title, description, tags } = req.body;
    const userId = req.result._id;

    const cloudinaryResource = await cloudinary.api.resource(cloudinaryPublicId, {
      resource_type: "video",
    });

    if (!cloudinaryResource) {
      return res.status(400).json({ error: "Video not found on Cloudinary" });
    }

    const existingVideo = await SolutionVideo.findOne({
      problemId,
      userId,
      cloudinaryPublicId,
    });

    if (existingVideo) {
      return res.status(409).json({ error: "Video already exists" });
    }

    //  Properly generate a thumbnail URL
    const thumbnailUrl = cloudinary.url(cloudinaryPublicId, {
      resource_type: "video",
      transformation: [
        { width: 400, height: 225, crop: "fill" },
        { quality: "auto" },
        { start_offset: 1 },
      ],
      fetch_format: "jpg",
    });

    const videoSolution = await SolutionVideo.create({
      problemId,
      userId,
      cloudinaryPublicId,
      secureUrl,
      duration: cloudinaryResource.duration || duration,
      thumbnailUrl,
      title,
      description,
      tags,
    });

    // Update Problem document with video metadata
    await Problem.findByIdAndUpdate(problemId, {
      secureUrl,
      thumbnailUrl,
      duration: cloudinaryResource.duration || duration,
    });

    res.status(201).json({
      message: "Video solution saved successfully",
      videoSolution: {
        id: videoSolution._id,
        thumbnailUrl: videoSolution.thumbnailUrl,
        duration: videoSolution.duration,
        uploadedAt: videoSolution.createdAt,
      },
    });
  } catch (error) {
    console.error("Error saving video metadata:", error);
    res.status(500).json({ error: "Failed to save video metadata" });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.result._id;

    //  Ensure only the user's video is deleted
    const video = await SolutionVideo.findOneAndDelete({ problemId, userId });
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    await cloudinary.uploader.destroy(video.cloudinaryPublicId, {
      resource_type: "video",
      invalidate: true,
    });

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Failed to delete video" });
  }
};

const checkIfVideoExists = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.result._id;

    const video = await SolutionVideo.findOne({ problemId, userId });

    if (!video) {
      return res.status(200).json({ exists: false });
    }

    return res.status(200).json({
      exists: true,
      video: {
        id: video._id,
        secureUrl: video.secureUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        uploadedAt: video.createdAt,
      },
    });
  } catch (error) {
    console.error("Error checking video existence:", error);
    res.status(500).json({ error: "Failed to check video status" });
  }
};


module.exports = {
  generateUploadSignature,
  saveVideoMetadata,
  deleteVideo,
  checkIfVideoExists,
};
