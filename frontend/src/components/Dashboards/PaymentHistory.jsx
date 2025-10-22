import React from "react";
import { useSelector } from "react-redux";
import { IndianRupee, ShoppingCart, History } from "lucide-react";

const PaymentHistory = () => {
  const { user } = useSelector((state) => state.auth);

  const getPlanDisplayName = (plan) => {
    if (plan === "buy_tokens") {
      return "Tokens Purchase";
    }
    return `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <History className="text-orange-400" />
        Payment History
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="p-4 text-slate-300 font-semibold">Date</th>
              <th className="p-4 text-slate-300 font-semibold">Plan</th>
              <th className="p-4 text-slate-300 font-semibold">Amount</th>
              <th className="p-4 text-slate-300 font-semibold">Order ID</th>
            </tr>
          </thead>
          <tbody>
            {user?.paymentHistory?.length > 0 ? (
              user.paymentHistory.map((payment, index) => (
                <tr key={index} className="border-b border-slate-800 hover:bg-slate-700/50 transition-colors">
                  <td className="p-4 text-slate-400">{new Date(payment.date).toLocaleDateString()}</td>
                  <td className="p-4 text-orange-400 font-medium">{getPlanDisplayName(payment.plan)}</td>
                  <td className="p-4 text-slate-300 flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    {payment.amount}
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-xs">{payment.orderId}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-8 text-slate-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  No payment history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
