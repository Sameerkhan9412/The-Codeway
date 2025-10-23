const crypto = require('crypto');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const redisWrapper = require('../config/redis');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// Configure nodemailer transporter (example using Gmail SMTP)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Rate limiting configuration (5 requests per 10 minutes per email)
const OTP_RATE_LIMIT = {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5
};

function generateOTP() {
    return crypto.randomInt(100000, 1000000).toString();
}

async function sendOTPEmail(email, otp) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for CodeWay Verification',
        text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`,
        html: `<p>Your OTP code is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`
    };
    await transporter.sendMail(mailOptions);
}

// Signup with email verification OTP sending
const signupWithVerification = async (req, res) => {
    try {
        const { firstName, emailId, password, confirmPassword } = req.body;

        // Validate inputs
        if (!firstName || !emailId || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (!validator.isEmail(emailId)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ emailId: emailId.toLowerCase() });
        if (existingUser) {
            if (!existingUser.emailVerified) {
                // If user exists but not verified, resend OTP
                const otp = generateOTP();
                await redisWrapper.set(`otp:${emailId.toLowerCase()}`, otp, 'EX', 300); // 5 minutes expiry
                await sendOTPEmail(emailId, otp);
                return res.status(200).json({
                    success: true,
                    message: 'User already registered but not verified. New OTP sent to email for verification.',
                    user: {
                        _id: existingUser._id,
                        firstName: existingUser.firstName,
                        emailId: existingUser.emailId,
                        emailVerified: existingUser.emailVerified
                    }
                });
            } else {
                return res.status(400).json({ success: false, message: 'User with this email already exists and is verified' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store user data temporarily in Redis, do NOT create user in DB yet
        const tempUserData = {
            firstName,
            emailId: emailId.toLowerCase(),
            password: hashedPassword,
            role: 'user',
            emailVerified: false // Always false at this stage
        };
        // Store temporary user data with a key that includes email and a short expiry
        await redisWrapper.set(`pending_signup:${emailId.toLowerCase()}`, JSON.stringify(tempUserData), 'EX', 300); // 5 minutes expiry

        // Generate OTP and store in Redis
        const otp = generateOTP();
        await redisWrapper.set(`otp:${emailId.toLowerCase()}`, otp, 'EX', 300); // 5 minutes expiry

        // Send OTP email
        await sendOTPEmail(emailId, otp);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email for verification. Please complete the verification to create your account.',
            needsVerification: true,
            email: emailId
        });
    } catch (error) {
        console.error('Error in signupWithVerification:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Verify OTP and mark user as verified
const verifySignupOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({ success: false, message: 'OTP must be 6 digits' });
        }

        const storedOTP = await redisWrapper.get(`otp:${email.toLowerCase()}`);
        if (!storedOTP) {
            return res.status(400).json({ success: false, message: 'OTP expired or not found' });
        }
        if (storedOTP !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Retrieve temporary user data from Redis
        const pendingUserDataString = await redisWrapper.get(`pending_signup:${email.toLowerCase()}`);
        if (!pendingUserDataString) {
            return res.status(400).json({ success: false, message: 'Signup session expired or not found. Please try signing up again.' });
        }

        const pendingUserData = JSON.parse(pendingUserDataString);

        // Check if user already exists (edge case: user might have started signup, then verified via Google, etc.)
        let user = await User.findOne({ emailId: email.toLowerCase() });
        if (user) {
            if (user.emailVerified) {
                // If user already exists and is verified, it means they completed verification through another flow (e.g., Google)
                await redisWrapper.del(`otp:${email.toLowerCase()}`);
                await redisWrapper.del(`pending_signup:${email.toLowerCase()}`);
                return res.status(200).json({
                    success: true,
                    message: 'Email already verified. Logging in.',
                    user: {
                        _id: user._id,
                        firstName: user.firstName,
                        emailId: user.emailId,
                        emailVerified: user.emailVerified,
                        role: user.role
                    },
                    token: jwt.sign({ _id: user._id, emailId: user.emailId, role: user.role }, process.env.JWT_SECRET, { expiresIn: 604800 })
                });
            } else {
                // This case should ideally not happen if pending_signup is used correctly, but as a fallback
                user.emailVerified = true;
                await user.save();
            }
        } else {
            // Create the user permanently in the database ONLY after successful OTP verification
            user = new User({
                firstName: pendingUserData.firstName,
                emailId: pendingUserData.emailId,
                password: pendingUserData.password,
                role: pendingUserData.role,
                emailVerified: true // Set to true as verification is successful
            });
            await user.save();
        }

        // Clean up Redis
        await redisWrapper.del(`otp:${email.toLowerCase()}`);
        await redisWrapper.del(`pending_signup:${email.toLowerCase()}`);

        // Generate JWT token
        const token = jwt.sign({ _id: user._id, emailId: user.emailId, role: user.role }, process.env.JWT_SECRET, { expiresIn: 604800 }); // 7 days

        // Set token as HTTP-only cookie
        res.cookie("token", token, { maxAge: 604800000, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. Account created and logged in.',
            user: {
                _id: user._id,
                firstName: user.firstName,
                emailId: user.emailId,
                emailVerified: user.emailVerified,
                role: user.role
            },
            token: token
        });
    } catch (error) {
        console.error('Error in verifySignupOTP:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    signupWithVerification,
    verifySignupOTP
};
