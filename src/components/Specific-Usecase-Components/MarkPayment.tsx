import { useState } from "react";
import { loadRazorpayScript } from "../../utils/razorpayUtils";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface MarkPaymentProps {
  amount: number;
  plan: string;
  onSuccess: (plan: string) => void;
  onError: (message: string) => void;
  disabled: boolean;
  user: {
    whatsappNumber: string;
    username: string;
    email: string;
    contact?: string; // Optional: Add if contact is available
  };
}

const MarkPayment: React.FC<MarkPaymentProps> = ({ amount, plan, onSuccess, onError, disabled, user }) => {
  const [loading, setLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const paymentapi = import.meta.env.VITE_API_paymentapi;

  const handlePayment = async () => {
    setLoading(true);

    try {
      const isRazorpayLoaded = await loadRazorpayScript();
      if (!isRazorpayLoaded) {
        onError("Failed to load Razorpay. Please check your internet connection.");
        return;
      }

      const res = await fetch(`${baseUrl}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, plan }),
      });

      const data = await res.json();
      if (!data.order_id) {
        onError("Order creation failed. Please try again.");
        return;
      }

      const options = {
        key: paymentapi, // Replace with your Razorpay Key
        amount: data.amount,
        currency: "INR",
        name: "MARKPYROPRIME",
        description: `Subscription for ${plan}`,
        order_id: data.order_id,
        handler: (response: RazorpayResponse) => {
          verifyPayment(response);
        },
        prefill: {
          name: user.username, // Use real user name
          email: user.email, // Use real user email
          contact: user.whatsappNumber || "9999999999", // Use real user contact if available
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      onError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentData: RazorpayResponse) => {
    try {
      console.log("Verifying payment with data:", {
        plan,
        razorpay_payment_id: paymentData.razorpay_payment_id,
      });
  
      const res = await fetch(`${baseUrl}/api/user/update-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          plan,
          razorpay_payment_id: paymentData.razorpay_payment_id,
        }),
      });
  
      const result = await res.json();
      console.log("Backend response:", result);
  
      if (result.message === "Subscription updated successfully") {
        onSuccess(plan); // Notify Pricing page of success
      } else {
        onError(result.message || "Subscription update failed. Please contact support.");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      onError("Error verifying payment. Please try again.");
    }
  };
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Subscribe to {plan}</h2>
      <button
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
        onClick={handlePayment}
        disabled={loading || disabled}
      >
        {loading ? "Processing..." : `Pay ₹${amount / 100}`}
      </button>
    </div>
  );
};

export default MarkPayment;