import React, { useState, useEffect } from "react";
import {
  Check,
  Star,
  Zap,
  Brain,
  Code,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Crown,
  Gift,
  Home,
  ArrowLeft,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getProfile } from "../../slice/authSlice";
import axiosClient from "../../utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import Success from "./Success";

const Premium = () => {
  const [isLoading, setIsLoading] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedPlan, setPurchasedPlan] = useState(null);
  const [redirectCount, setRedirectCount] = useState(5);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: 199,
      originalPrice: 299,
      icon: <Code className="w-8 h-8" />,
      popular: false,
      color: "from-blue-500 to-cyan-500",
      features: [
        "AI Code Assistant",
        "Basic Interview Prep",
        "10 Practice Problems/month",
        "Community Access",
        "Basic Analytics",
        "Email Support",
      ],
    },
    {
      id: "pro",
      name: "Professional",
      price: 499,
      originalPrice: 799,
      icon: <Brain className="w-8 h-8" />,
      popular: true,
      color: "from-purple-500 to-pink-500",
      features: [
        "Advanced AI Interview Coach",
        "Unlimited Practice Problems",
        "Real-time Code Review",
        "Mock Interview Sessions",
        "Advanced Analytics Dashboard",
        "Priority Support",
        "Custom Learning Path",
        "API Access",
      ],
    },
    {
      id: "ultimate",
      name: "Ultimate",
      price: 799,
      originalPrice: 1199,
      icon: <Sparkles className="w-8 h-8" />,
      popular: false,
      color: "from-orange-500 to-red-500",
      features: [
        "Everything in Professional",
        "Personal AI Mentor",
        "1-on-1 Expert Sessions",
        "Company-specific Prep",
        "Advanced System Design",
        "White-label Solutions",
        "Custom Integrations",
        "Dedicated Account Manager",
      ],
    },
  ];

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      setRazorpayLoaded(false);
      alert("Failed to load payment gateway. Please refresh the page.");
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // Countdown and redirect effect
  useEffect(() => {
    if (showSuccess) {
      const timer = setInterval(() => {
        setRedirectCount((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showSuccess, navigate]);

  const handlePlanSelect = async (planId) => {
    if (!razorpayLoaded) {
      alert("Payment gateway not loaded. Please refresh the page.");
      return;
    }

    if (!user?._id) {
      alert("Please login first.");
      return;
    }

    setIsLoading(planId);

    try {
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;

      if (!razorpayKey) {
        alert("❌ Razorpay key not configured. Please contact support.");
        setIsLoading(null);
        return;
      }

      console.log("Razorpay Key:", razorpayKey);

      const { data: order } = await axiosClient.post(
        "/payments/create-order",
        { plan: planId }
      );

      console.log("Order created:", order);

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "The CodeWay Premium",
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
        order_id: order.id,
        handler: async (response) => {
          console.log("Payment response:", response);
          try {
            const verifyResponse = await axiosClient.post(
              "/payments/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planId,
                userId: user._id,
              }
            );

            console.log("Verification response:", verifyResponse.data);

            if (verifyResponse.data.success) {
              dispatch(getProfile());
              const selectedPlan = plans.find((plan) => plan.id === planId);
              console.log("Selected plan:", selectedPlan); 
              
              if (selectedPlan) {
                setPurchasedPlan(selectedPlan);
                setShowSuccess(true);
              } else {
                console.error("Plan not found:", planId);
                alert("⚠️ Plan configuration error. Please contact support.");
              }
            } else {
              alert(
                "⚠️ Payment verified but activation failed. Please contact support."
              );
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert(
              `❌ Payment verification failed: ${
                error.response?.data?.message || error.message
              }`
            );
          }
          setIsLoading(null);
        },
        prefill: {
          name: user?.firstName || "CodeWay User",
          email: user?.emailId || "test@example.com",
          contact: user?.phoneNumber || "",
        },
        theme: {
          color: "#ff6b35",
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed");
            setIsLoading(null);
          },
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
        timeout: 300,
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        const errorMessage =
          response.error?.description ||
          response.error?.reason ||
          "Unknown error";
        alert(`❌ Payment failed: ${errorMessage}`);
        setIsLoading(null);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      alert(`❌ Payment could not be started: ${errorMessage}`);
      setIsLoading(null);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleBuyTokens = async () => {
    if (!razorpayLoaded) {
      alert("Payment gateway not loaded. Please refresh the page.");
      return;
    }
    if (!user?._id) {
      alert("Please login first.");
      return;
    }
    setIsLoading("buy_tokens");
    try {
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
      if (!razorpayKey) {
        alert("❌ Razorpay key not configured. Please contact support.");
        setIsLoading(null);
        return;
      }
      const { data: order } = await axiosClient.post(
        "/payments/create-order",
        { plan: "buy_tokens" }
      );
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "CodeWay Premium",
        description: "Buy More Tokens",
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyResponse = await axiosClient.post(
              "/payments/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: "buy_tokens",
                userId: user._id,
              }
            );
            if (verifyResponse.data.success) {
              dispatch(getProfile());
              setPurchasedPlan({ name: "Tokens" });
              setShowSuccess(true);
            } else {
              alert(
                "⚠️ Payment verified but activation failed. Please contact support."
              );
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert(
              `❌ Payment verification failed: ${
                error.response?.data?.message || error.message
              }`
            );
          }
          setIsLoading(null);
        },
        prefill: {
          name: user?.firstName || "CodeWay User",
          email: user?.emailId || "test@example.com",
          contact: user?.phoneNumber || "",
        },
        theme: {
          color: "#ff6b35",
        },
        modal: {
          ondismiss: () => {
            setIsLoading(null);
          },
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
        timeout: 300,
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        const errorMessage =
          response.error?.description ||
          response.error?.reason ||
          "Unknown error";
        alert(`❌ Payment failed: ${errorMessage}`);
        setIsLoading(null);
      });
      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      alert(`❌ Payment could not be started: ${errorMessage}`);
      setIsLoading(null);
    }
  };

  if (showSuccess && purchasedPlan) {
    return (
      <Success 
        showSuccess={showSuccess} 
        purchasedPlan={purchasedPlan} 
        redirectCount={redirectCount}  
        handleGoHome={handleGoHome} 
      />
    );
  }

  // Original Premium Plans UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <NavLink to="/">
          <button className="absolute top-6 left-6 hover:text-orange-400 flex items-center text-gray-400 htransition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </NavLink>
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Unlock AI-powered coding, interview prep, and mentorship.
          </p>
        </div>

        {user?.isPremium && (
          <div className="mb-12">
            <div className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                You are a Premium User!
              </h2>
              <p className="text-slate-300 mb-6">
                You can now purchase more tokens to continue using our AI
                features.
              </p>
              <button
                onClick={handleBuyTokens}
                disabled={isLoading === "buy_tokens" || !razorpayLoaded}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group/btn bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg shadow-green-500/25 ${
                  isLoading === "buy_tokens" || !razorpayLoaded
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isLoading === "buy_tokens" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Buy More Tokens
                    <ArrowRight className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative group transition-all duration-500 transform hover:scale-105 ${
                plan.popular ? "md:-translate-y-4" : ""
              }`}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}
              <div
                className={`relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 h-full transition-all duration-500 ${
                  hoveredPlan === plan.id
                    ? "border-orange-500/50 shadow-2xl shadow-orange-500/20"
                    : ""
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${plan.color} mb-6`}
                >
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-8">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold">₹{plan.price}</span>
                    <span className="text-slate-400 text-lg">/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 line-through">
                      ₹{plan.originalPrice}
                    </span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm">
                      Save{" "}
                      {Math.round((1 - plan.price / plan.originalPrice) * 100)}%
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={isLoading === plan.id || !razorpayLoaded}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group/btn ${
                    plan.popular
                      ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  } ${
                    isLoading === plan.id || !razorpayLoaded
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isLoading === plan.id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Choose {plan.name}
                      <ArrowRight className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Premium;
