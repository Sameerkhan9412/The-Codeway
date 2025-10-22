const razorpay = require("../config/payGateway");
const crypto = require("crypto");
const User = require("../models/user");

const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    const prices = {
      starter: 199,
      pro: 499,
      ultimate: 799,
      buy_tokens: 99,
    };

    if (!prices[plan]) {
      return res.status(400).json({ 
        success: false, 
        msg: "Invalid plan selected." 
      });
    }

    const amount = prices[plan] * 100; // Razorpay needs amount in paise
    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        plan: plan,
        created_at: new Date().toISOString()
      }
    };


    const order = await razorpay.orders.create(options);
    console.log("Order created successfully:", order);

    res.status(200).json({
      success: true,
      ...order
    });
  } catch (err) {
    console.error("❌ Razorpay Order Creation Failed:", err);
    res.status(500).json({ 
      success: false,
      msg: "Order creation failed", 
      error: err.message 
    });
  }
};

const verifyOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, plan } = req.body;

    console.log("Verification request received:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature ? "***" : "missing",
      userId,
      plan
    });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !plan) {
      return res.status(400).json({ 
        success: false, 
        msg: "Missing required fields for verification" 
      });
    }

    // Step 1: Verify Signature
    const razorpaySecret = process.env.RAZORPAY_SECRET;
    if (!razorpaySecret) {
      console.error("❌ Razorpay secret not configured");
      return res.status(500).json({ 
        success: false, 
        msg: "Payment configuration error" 
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("Signature verification:", {
      generated: generatedSignature,
      received: razorpay_signature,
      match: generatedSignature === razorpay_signature
    });

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        msg: "Payment signature verification failed" 
      });
    }

    // Step 2: Allocate tokens and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    if (plan === "buy_tokens") {
      const tokens = 100;
      console.log(`Adding ${tokens} tokens for user ${userId}`);
      user.tokensLeft = (user.tokensLeft || 0) + tokens;
      user.paymentHistory.push({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: 99,
        plan: "buy_tokens",
      });
    } else {
      let tokens = 100;
      if (plan === "pro") tokens = 300;
      else if (plan === "ultimate") tokens = 1000;

      console.log(
        `Activating ${plan} plan for user ${userId} with ${tokens} tokens`
      );

      user.isPremium = true;
      user.tokensLeft = (user.tokensLeft || 0) + tokens;
      user.premiumExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      user.premiumPlan = plan;
      user.paymentHistory.push({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: tokens === 100 ? 199 : tokens === 300 ? 499 : 799,
        plan: plan,
      });
    }

    await user.save();


    return res.status(200).json({ 
      success: true, 
      msg: "Premium activated successfully",
      user: {
        isPremium: user.isPremium,
        tokensLeft: user.tokensLeft,
        premiumExpiry: user.premiumExpiry,
        premiumPlan: user.premiumPlan
      }
    });

  } catch (err) {
    console.error("❌ Error verifying payment:", err);
    return res.status(500).json({ 
      success: false, 
      msg: "Payment verification failed", 
      error: err.message 
    });
  }
};

module.exports = { createOrder, verifyOrder };
