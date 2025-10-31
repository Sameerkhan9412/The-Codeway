const {OAuth2Client} = require ('google-auth-library');
const axios = require ('axios');
const redisWrapper = require ('../config/redis');
const validate = require ('../utils/validator');
const bcrypt = require ('bcrypt');
const User = require ('../models/user');
const Submission = require ('../models/submission');
const Contest = require ('../models/contest');
const Problem = require ('../models/problem');
const jwt = require ('jsonwebtoken');
const {generateProfileImage} = require ('../utils/profileImageGenerator');

const cloudinary = require ('cloudinary').v2;
const multer = require ('multer');

// Configure Cloudinary
cloudinary.config ({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Google OAuth2 client
const client = new OAuth2Client (process.env.GOOGLE_CLIENT_ID);

// Multer setup for memory storage (buffer)
const storage = multer.memoryStorage ();
const upload = multer ({
  storage,
  limits: {fileSize: 2 * 1024 * 1024}, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test (file.originalname.toLowerCase ());
    const mimetype = allowedTypes.test (file.mimetype);
    if (extname && mimetype) cb (null, true);
    else cb (new Error ('Only images are allowed (jpeg, jpg, png)'));
  },
}).single ('profileImage');

const register = async (req, res) => {
  try {
    const {firstName, emailId, password, confirmPassword} = req.body;

    // Validate inputs
    if (!firstName || !emailId || !password || !confirmPassword) {
      return res
        .status (400)
        .json ({success: false, message: 'All fields are required'});
    }
    if (password !== confirmPassword) {
      return res
        .status (400)
        .json ({success: false, message: 'Passwords do not match'});
    }

    // Check if user already exists
    const existingUser = await User.findOne ({emailId: emailId.toLowerCase ()});
    if (existingUser) {
      return res
        .status (400)
        .json ({
          success: false,
          message: 'User with this email already exists',
        });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash (password, 10);

    // Create new user
    const newUser = new User ({
      firstName,
      emailId: emailId.toLowerCase (),
      password: hashedPassword,
      emailVerified: false, // Set emailVerified to false
    });

    // Generate and set profile image
    if (!newUser.profileImage) {
      const imageUrl = await generateProfileImage (
        newUser.firstName,
        newUser._id
      );
      newUser.profileImage = imageUrl;
    }

    await newUser.save ();

    // Generate JWT token
    const token = jwt.sign (
      {_id: newUser._id, emailId: newUser.emailId, role: newUser.role},
      process.env.JWT_SECRET,
      {expiresIn: 604800}
    );
    res.cookie ('token', token, {
      maxAge: 604800000,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status (201).json ({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        emailId: newUser.emailId,
        emailVerified: newUser.emailVerified,
        profileImage: newUser.profileImage,
      },
      token,
    });
  } catch (error) {
    res.status (500).json ({success: false, message: 'Internal server error'});
  }
};

const login = async (req, res) => {
  try {
    const {emailId, password} = req.body;
    if (!emailId || !password) throw new Error ('Credentials Missing');

    const user = await User.findOne ({emailId});
    if (!user) {
      return res.status (403).send ('Error Invalid Credentials');
    }

    if (!user.emailVerified) {
      return res.status (403).json ({
        success: false,
        message: 'Email not verified. Please verify your email before logging in.',
        needsVerification: true,
        email: emailId,
      });
    }

    const match = await bcrypt.compare (password, user.password);
    if (!match) {
      return res.status (403).send ('Error Invalid Credentials');
    }

    // Increase token expiration to 7 days (604800 seconds)
    const token = jwt.sign (
      {_id: user._id, emailId: user.emailId, role: user.role},
      process.env.JWT_SECRET,
      {expiresIn: 604800}
    );
    // Increase cookie maxAge to 7 days (604800000 milliseconds)
    // res.cookie("token", token, { maxAge: 604800000, httpOnly: true, sameSite: 'none', secure: true });
    res.cookie ('token', token, {
      httpOnly: true,
      secure: true, // required for HTTPS (Render uses HTTPS)
      sameSite: 'none', // required for cross-site cookies
      path: '/', // optional but good
    });

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    res
      .status (201)
      .json ({user: reply, token, message: 'Logged In Successfully'});
  } catch (err) {
    res.status (403).send ('Error ' + err);
  }
};

const logout = async (req, res) => {
  try {
    const {token} = req.cookies;
    await redisWrapper.set (`token:${token}`, 'Blocked');

    const payload = jwt.decode (token);
    await redisWrapper.expireAt (`token:${token}`, payload.exp);

    res.cookie ('token', null, {
      expires: new Date (Date.now ()),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    res.status (200).send ('User Logged Out Successfully');
  } catch (err) {
    res.status (401).send ('Error : ' + err);
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById (userId)
      .populate ({
        path: 'problemSolved',
        select: 'title difficulty tags createdAt',
        options: {sort: {createdAt: -1}, limit: 5},
      })
      .select ('-password -confirmPassword -__v');

    if (!user) return res.status (404).json ({message: 'User not found'});

    const problemStats = user.problemSolved.reduce (
      (acc, problem) => {
        acc.total++;
        acc[problem.difficulty]++;
        return acc;
      },
      {total: 0, easy: 0, medium: 0, hard: 0}
    );

    res.status (200).json ({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName || '',
        age: user.age || '',
        emailId: user.emailId,
        role: user.role,
        createdAt: user.createdAt,
        problemStats,
        recentSubmissions: user.problemSolved,
        profileImage: user.profileImage,
        emailVerified: user.emailVerified,
        socialLinks: user.socialLinks || {},
        streak: user.streak || 0, // Ensure streak is always a number
        isPremium: user.isPremium,
        tokensLeft: user.tokensLeft,
        paymentHistory: user.paymentHistory || [],
      },
    });
  } catch (err) {
    res.status (500).json ({error: err.message});
  }
};

const updateProfile = (req, res) => {
  upload (req, res, async function (err) {
    if (err) return res.status (400).json ({error: err.message});

    try {
      const userId = req.result._id;
      const updateData = {...req.body};

      if (req.file) {
        const uploadToCloudinary = () => {
          return new Promise ((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream (
              {
                folder: 'profileImages',
                public_id: userId.toString (),
                overwrite: true,
              },
              (error, result) => (error ? reject (error) : resolve (result))
            );
            stream.end (req.file.buffer);
          });
        };
        const result = await uploadToCloudinary ();
        updateData.profileImage = result.secure_url;
      }

      if (updateData.socialLinks) {
        try {
          updateData.socialLinks = JSON.parse (updateData.socialLinks);
        } catch (e) {
          return res.status (400).json ({error: 'Invalid socialLinks format'});
        }
      }

      const user = await User.findByIdAndUpdate (userId, updateData, {
        new: true,
      }).select ('-password -confirmPassword -__v');

      if (!user) return res.status (404).json ({message: 'User not found'});

      res.status (200).json ({
        message: 'Profile updated successfully',
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName || '',
          age: user.age || '',
          emailId: user.emailId,
          role: user.role,
          createdAt: user.createdAt,
          profileImage: user.profileImage,
          emailVerified: user.emailVerified,
          socialLinks: user.socialLinks || {},
        },
      });
    } catch (error) {
      res.status (500).json ({error: error.message});
    }
  });
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    await User.findByIdAndDelete (userId);
    res.status (200).send ('User Deleted Successfully');
  } catch (err) {
    res.status (403).send ('Error Occured ' + err);
  }
};

const activeUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments ({});
    res
      .status (200)
      .json ({message: 'User count fetched successfully', count: userCount});
  } catch (err) {
    res
      .status (500)
      .json ({message: 'Error while fetching user Count', error: err.message});
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find ({}, '-password -confirmPassword -__v');
    res.status (200).json ({
      message: 'All users fetched successfully',
      users,
    });
  } catch (err) {
    res
      .status (500)
      .json ({message: 'Error while fetching users', error: err.message});
  }
};

const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments ();
    const totalSubmissions = await Submission.countDocuments ();
    const totalContests = await Contest.countDocuments ();
    const totalProblems = await Problem.countDocuments ();

    res.status (200).json ({
      message: 'Platform stats fetched successfully',
      stats: {
        totalUsers,
        totalSubmissions,
        totalContests,
        totalProblems,
      },
    });
  } catch (err) {
    res
      .status (500)
      .json ({
        message: 'Error while fetching platform stats',
        error: err.message,
      });
  }
};

const updateAllProfileImages = async (req, res) => {
  try {
    const usersWithoutImage = await User.find ({
      profileImage: {$in: [null, '']},
    });
    let updatedCount = 0;

    for (const user of usersWithoutImage) {
      try {
        const imageUrl = await generateProfileImage (user.firstName, user._id);
        await User.findByIdAndUpdate (user._id, {profileImage: imageUrl});
        updatedCount++;
      } catch (error) {
        console.error (
          `Failed to update profile image for user: ${user.emailId}`,
          error
        );
      }
    }

    res
      .status (200)
      .json ({message: `Updated profile images for ${updatedCount} users.`});
  } catch (error) {
    res
      .status (500)
      .json ({
        message: 'An error occurred during the update process:',
        error: error.message,
      });
  }
};

const googleLogin = async (req, res) => {
  try {
    const {token} = req.body; // This is the access_token from the frontend
    if (!token) return res.status (400).json ({message: 'Token is required'});

    // Use the access token to get user info from Google
    const response = await axios.get (
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const {sub, email, given_name, family_name, picture} = response.data;

    let user = await User.findOne ({emailId: email});

    if (!user) {
      // For new users signing up with Google, we'll use their Google ID (`sub`) as a basis for a password.
      // It's important to hash this before storing it.
      const salt = await bcrypt.genSalt (10);
      const hashedPassword = await bcrypt.hash (sub, salt);

      user = new User ({
        firstName: given_name,
        lastName: family_name || '',
        emailId: email,
        password: hashedPassword, // Store a hashed password
        profileImage: picture,
        emailVerified: true, // Email is verified by Google
        role: 'user',
        socialLinks: {},
      });
      await user.save ();
    }

    // If the user exists, we proceed to log them in.
    // The normal login flow checks the password, but for Google login,
    // a successful token verification is sufficient.

    const jwtToken = jwt.sign (
      {_id: user._id, emailId: user.emailId, role: user.role},
      process.env.JWT_SECRET,
      {expiresIn: 604800} // 7 days
    );

    res.cookie ('token', jwtToken, {
      maxAge: 604800000, // 7 days
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status (200).json ({
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role: user.role,
        profileImage: user.profileImage,
      },
      token: jwtToken,
      message: 'Logged in with Google successfully',
    });
  } catch (error) {
    console.error (
      'Google login error:',
      error.response ? error.response.data : error.message
    );
    res
      .status (500)
      .json ({message: 'Google login failed', error: error.message});
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  deleteProfile,
  activeUsers,
  googleLogin,
  getAllUsers,
  getPlatformStats,
  updateAllProfileImages,
};
