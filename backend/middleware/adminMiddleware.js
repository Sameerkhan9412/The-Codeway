const jwt = require("jsonwebtoken");
const redisWrapper = require("../config/redis");
const User = require("../models/user");


const adminMiddleware = async (req , res , next) =>{
    try{

        const {token} = req.cookies;

        if(!token)
            throw new Error("Invalid Token");

        //validate the token
         const payload = jwt.verify(token , process.env.JWT_SECRET);
          console.log(payload)
         console.log(payload.role)
         if(payload.role!="admin")
            throw new Error(" Authenticated Path");

         const {_id} = payload;

         if(!_id)
            throw new Error(" Id is Missing");

         const result = await User.findById(_id);

         if(!result)
            throw new Error(" User Doesn't Exists");

        //  redis blocking 
        const isBlocked = await redisWrapper.exists(`token:${token}`);

        if(isBlocked)
            throw new Error(" Invalid Token");

        req.result = result;

        next();


    }catch(err){
        res.status(401).send("Error Occured " + err );
    }
}

module.exports = adminMiddleware