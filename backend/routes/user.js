const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/googleLogin", async (req, res) => {
    const { token } = req.body;

    try {
        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // Use the environment variable
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // Check if the user already exists
        let user = await User.findOne({ emailId: email });
        if (!user) {
            // If the user doesn't exist, create a new account
            user = new User({
                emailId: email,
                firstName: name.split(" ")[0],
                lastName: name.split(" ")[1] || "",
                profileImage: picture,
                emailVerified: true,
                isPremium: false, // Default values for new users
                tokensLeft: 10,   // Default tokens for new users
            });
            await user.save();
        }

        // Generate a JWT token
        const jwtToken = jwt.sign(
            { userId: user._id, email: user.emailId },
            process.env.JWT_SECRET, // Use a secret key from your environment variables
            { expiresIn: "7d" } // Token valid for 7 days
        );

        // Return the user data and token
        res.status(200).json({ message: "Login successful", user, token: jwtToken });
    } catch (error) {
        console.error("Error during Google Login:", error.message);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
});

module.exports = router;