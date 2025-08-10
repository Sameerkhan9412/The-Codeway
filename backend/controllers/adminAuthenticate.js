const User = require("../models/user");
const validate = require("../utils/validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

const adminRegister = async (req , res) =>{
    try {

        validate(req.body);
        const { firstName, emailId, password } = req.body;

        if(!firstName || !emailId)
            throw new Error("Credentials Missing");

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = "admin";
        const user = await User.create(req.body);
        
        // created account login directy by using that token 
        // Increase token expiration to 7 days (604800 seconds)
        const token = jwt.sign({ _id: user._id, emailId: user.emailId , role:user.role}, process.env.JWT_SECRET, { expiresIn: 604800 });

        // Increase cookie maxAge to 7 days (604800000 milliseconds)
        res.cookie("token", token, { maxAge: 604800000, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });

        res.status(201).send("User Registered Successfully");


    } catch (err) {
        res.status(401).send("Error :- " + err);
    }
}


module.exports = adminRegister;
