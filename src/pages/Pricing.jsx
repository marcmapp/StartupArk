import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MarkPayment from "../components/Specific-Usecase-Components/MarkPayment";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import Modal from "../components/Model"; // Ensure this path is correct
import pricingData from "../Jsons/Data/PricingDetails.json";


const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [user, setUser] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const [userRes, subscriptionRes] = await Promise.all([
          axios.get(`${baseUrl}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/api/user/subscription`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const userData = {
          ...userRes.data,
          subscriptionPlan: subscriptionRes.data.plan,
          planExpiry: subscriptionRes.data.expiryDate,
        };

        // Check if subscription has expired
        if (subscriptionRes.data.expiryDate) {
          const expiryDate = new Date(subscriptionRes.data.expiryDate);
          const currentDate = new Date();

          if (currentDate > expiryDate) {
            await axios.post(`${baseUrl}/api/user/update-plan`, {
              email: userRes.data.email,
              plan: "No Subscription",
            });

            userData.subscriptionPlan = "No Subscription";
            userData.planExpiry = null;
          }
        }

        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/");
      }
    };

    fetchUser();
    setPlans(pricingData);
  }, [navigate]);



  const handlePaymentSuccess = async (subscriptionPlan) => {
    try {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      await axios.post(`${baseUrl}/api/user/update-plan`, {
        email: user.email,
        plan: subscriptionPlan,
        expiryDate: expiryDate.toISOString(),
      });

      setModalMessage("Payment Successful! Subscription updated.");
      setShowModal(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Failed to update plan:", error);
      setModalMessage("Payment successful, but failed to update plan. Contact support.");
      setShowModal(true);
    }
  };

  const handlePaymentError = (errorMessage) => {
    setModalMessage(errorMessage);
    setShowModal(true);
  };

  if (!user) {
    return <Loader />;
  }

  const isActivePlan = user.subscriptionPlan && user.subscriptionPlan !== "No Subscription";

  return (
    <div className="min-h-screen bg-white text-black flex justify-center items-center p-6">
    
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-6 text-center text-black">
          Pricing Plans
        </h1>
        <div className="text-center mb-8">
          <p className="text-lg">
            <strong>Name:</strong> {user.username}
          </p>
          <p className="text-lg">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-lg">
            <strong>Number:</strong> {user.whatsappNumber}
          </p>
        </div>

        {isActivePlan ? (
          <div className="text-center bg-white p-8 rounded-lg shadow-2xl border-2 border-black">
            <p className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              You are currently on the{" "}
              <span className="text-red-600 font-bold text-4xl">{user.subscriptionPlan}</span> plan.
            </p>
            <p className="text-xl">
              Your plan ends on{" "}
              <span className="text-sky-500 font-semibold">
                {user.planExpiry ? new Date(user.planExpiry).toDateString() : "N/A"}
              </span>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => {
              const isDisabled =
                user.subscriptionPlan === plan.name ||
                (user.subscriptionPlan === "Pro" && plan.name !== "Pro") ||
                user.subscriptionPlan === "Enterprise";

              return (
                <div
                  key={index}
                  className="p-8 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 hover:border-blue-500 transition-all duration-300 relative"
                >
                  {user.subscriptionPlan === plan.name && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-2 rounded-bl-lg">
                      Active
                    </div>
                  )}
                  <h2 className="text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    {plan.name}
                  </h2>
                  <p className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                    {plan.price}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-300">
                        <span className="mr-2 text-green-500">✔</span> {feature}
                      </li>
                    ))}
                  </ul>
                  <MarkPayment
                    amount={plan.amount}
                    plan={plan.name}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    disabled={isDisabled}
                    user={user}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showModal && (
        <Modal
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Pricing;