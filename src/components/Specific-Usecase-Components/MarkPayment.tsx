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
  product: string;
  onSuccess: (plan: string, subscriptions?: Record<string, unknown>) => void;
  onError: (message: string) => void;
  disabled: boolean;
  user: {
    whatsappNumber: string;
    username: string;
    email: string;
    contact?: string; // Optional: Add if contact is available
  };
  buttonText?: string;
  className?: string;
}

const MarkPayment: React.FC<MarkPaymentProps> = ({ amount, plan, product, onSuccess, onError, disabled, user, buttonText, className }) => {
  const [loading, setLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const paymentapi = import.meta.env.VITE_API_paymentapi;
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Free plans don't go through Razorpay at all — activate directly.
      if (amount === 0) {
        const res = await fetch(`${baseUrl}/api/mappuser/update-plan`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ product, plan }),
        });
        const result = await res.json();
        if (res.ok) {
          onSuccess(plan, result.subscriptions);
        } else {
          onError(result.message || "Failed to activate plan.");
        }
        return;
      }

      const isRazorpayLoaded = await loadRazorpayScript();
      if (!isRazorpayLoaded) {
        onError("Failed to load Razorpay. Please check your internet connection.");
        return;
      }

      const res = await fetch(`${baseUrl}/api/payment/create-order`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ product, plan }),
      });

      const data = await res.json();
      if (!data.order_id) {
        onError(data.error || "Order creation failed. Please try again.");
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
      const res = await fetch(`${baseUrl}/api/payment/payment-verify`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_signature: paymentData.razorpay_signature,
        }),
      });

      const result = await res.json();

      if (res.ok && result.status === "success") {
        onSuccess(plan, result.subscriptions); // Notify parent page of success
      } else {
        onError(result.message || "Payment verification failed. Please contact support.");
      }
    } catch (error) {
      onError("Error verifying payment. Please try again.");
    }
  };
  return (
    <div>
      <button
        className={className || "btn-mono w-full py-3"}
        onClick={handlePayment}
        disabled={loading || disabled}
      >
        {loading ? "Processing..." : buttonText || (amount > 0 ? `Pay ₹${amount / 100}` : "Get Started")}
      </button>
    </div>
  );
};

export default MarkPayment;
