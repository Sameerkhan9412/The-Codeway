const redisWrapper = require("../config/redis");
const crypto = require("crypto");

const windowsize = 3600; // 60 minutes
const max_Request = 20;

const rateLimiter = async (req, res, next) => {
    try {

        const ip = `IP:${req.ip}`
        const currentTime = Date.now() / 1000; // convert to seconds
        const window_time = currentTime - windowsize;

        await redisWrapper.zRemRangeByScore(ip, 0, window_time);

        const number_of_request = await redisWrapper.zCard(ip);

         if(number_of_request>max_Request)
            return res.status(500).send("Rate Limit Exceed , Try again Later.");

         const randomNumber = crypto.randomBytes(8).toString("hex");

         await redisWrapper.zAdd(ip, [{
            score: currentTime,
            value: `${currentTime}:${randomNumber}`
        }]);

        await redisWrapper.expire(ip, windowsize) ;

        next(); 

    } catch (err) {
        res.status(500).send("Error Occured" + err);
    }
}

module.exports = rateLimiter