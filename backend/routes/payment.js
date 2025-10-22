const express = require("express");
const {userMiddleware} = require("../middleware/userMiddleware");
const { createOrder , verifyOrder } = require("../controllers/paymentController");
const payRoute = express.Router();


payRoute.post("/create-order" , userMiddleware , createOrder );
payRoute.post("/verify" , userMiddleware , verifyOrder);

module.exports = payRoute;