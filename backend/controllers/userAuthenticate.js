const register = async (req, res) => {
    try {
        const { firstName, emailId, password, confirmPassword } = req.body;

        // Validate inputs
        if (!firstName || !emailId || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ emailId: emailId.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            firstName,
            emailId: emailId.toLowerCase(),
            password: hashedPassword,
            emailVerified: false, // Set emailVerified to false
        });

        // Generate and set profile image
        if (!newUser.profileImage) {
            const imageUrl = await generateProfileImage(newUser.firstName, newUser._id);
            newUser.profileImage = imageUrl;
        }

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ _id: newUser._id, emailId: newUser.emailId, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: 604800 });
        res.cookie("token", token, { maxAge: 604800000, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });

        res.status(201).json({
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
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;
        if (!emailId || !password) throw new Error("Credentials Missing");

        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(403).send("Error Invalid Credentials");
        }

        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: "Email not verified. Please verify your email before logging in.",
                needsVerification: true,
                email: emailId
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(403).send("Error Invalid Credentials");
        }

        // Increase token expiration to 7 days (604800 seconds)
        const token = jwt.sign({ _id: user._id, emailId: user.emailId, role: user.role }, process.env.JWT_SECRET, { expiresIn: 604800 });
        // Increase cookie maxAge to 7 days (604800000 milliseconds)
        res.cookie("token", token, { maxAge: 604800000, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role
        };

        res.status(201).json({ user: reply, token, message: "Logged In Successfully" });
    } catch (err) {
        res.status(403).send("Error " + err);
    }
};
