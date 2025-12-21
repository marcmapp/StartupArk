import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import MarkPayment from "../components/Specific-Usecase-Components/MarkPayment";
import Loader from "../components/Loader";
import Modal from "../components/Model";
import pricingConfig from "../Jsons/Data/PricingDetails.json";
import {
  CheckIcon,
  StarIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

// Icon mapping
const iconMap = {
  BuildingStorefrontIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BuildingOfficeIcon
};

const ProductPlans = () => {
  const [user, setUser] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeUserType, setActiveUserType] = useState("users");
  const { productId } = useParams();
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
          axios.get(`${baseUrl}/api/mappuser/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/api/mappuser/subscription`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const userData = {
          ...userRes.data,
          subscriptionPlan: subscriptionRes.data.plan,
          planExpiry: subscriptionRes.data.expiryDate,
        };

        if (subscriptionRes.data.expiryDate) {
          const expiryDate = new Date(subscriptionRes.data.expiryDate);
          const currentDate = new Date();

          if (currentDate > expiryDate) {
            await axios.post(`${baseUrl}/api/mappuser/update-plan`, {
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
  }, [navigate]);

  const handlePaymentSuccess = async (subscriptionPlan) => {
    try {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      await axios.post(`${baseUrl}/api/mappuser/update-plan`, {
        email: user.email,
        plan: subscriptionPlan,
        expiryDate: expiryDate.toISOString(),
      });

      setModalMessage("Payment Successful! Subscription updated.");
      setShowModal(true);

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

  // Redirect if product doesn't exist
  if (!pricingConfig.products[productId]) {
    navigate("/pricing");
    return null;
  }

  const currentProduct = pricingConfig.products[productId];
  const currentUserType = currentProduct.userTypes[activeUserType];
  const ProductIcon = iconMap[currentProduct.icon];
  const isActivePlan = user.subscriptionPlan && user.subscriptionPlan !== "No Subscription";

  const PlanCard = ({ plan, userType, product }) => {
    const isCurrentPlan = user.subscriptionPlan === plan.name;
    const isDisabled = isCurrentPlan || 
      (user.subscriptionPlan?.includes("Pro") && plan.name.includes("Basic")) ||
      (user.subscriptionPlan?.includes("Growth") && !plan.name.includes("Growth"));

    return (
      <div className={`relative rounded-2xl p-8 transition-all duration-300 border ${
        plan.popular 
          ? 'border-cyan-500/50 shadow-xl scale-[1.02]' 
          : 'border-gray-200/80 backdrop-blur-sm hover:border-cyan-300/50 hover:shadow-lg'
      }`}>
        {/* Popular Badge */}
        {plan.popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center shadow-lg">
              <StarIcon className="h-3 w-3 mr-1" />
              Most Popular
            </div>
          </div>
        )}

        {/* Current Plan Badge */}
        {isCurrentPlan && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              Current Plan
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-3">{plan.name}</h3>
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-3xl font-bold text-cyan-600">{plan.price}</span>
            {plan.amount > 0 && <span className="text-gray-600 text-sm">/month</span>}
          </div>
          {plan.amount > 0 && (
            <p className="text-gray-600 text-sm">billed monthly</p>
          )}
        </div>

        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
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
          buttonText={isCurrentPlan ? "Current Plan" : plan.cta}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 border ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
              : plan.popular
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-xl border-transparent'
              : 'text-cyan-600 border-cyan-600 hover:bg-cyan-600 hover:text-white hover:shadow-md'
          }`}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/pricing")}
            className="flex items-center text-cyan-600 hover:text-cyan-700 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Products
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-xl bg-cyan-100 flex items-center justify-center border border-cyan-200">
                <ProductIcon className="h-10 w-10 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {currentProduct.name} Plans
                </h1>
                <p className="mt-1 text-gray-600">
                  {currentProduct.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Subscription Status */}
        {isActivePlan && (
          <div className="rounded-2xl border border-cyan-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Active Subscription</h2>
                  <p className="text-gray-600">
                    You're subscribed to <span className="font-semibold text-cyan-600">{currentProduct.name}</span> as{" "}
                    <span className="font-semibold text-blue-600">{user.startuparkRole || 'User'}</span> with the{" "}
                    <span className="font-semibold text-green-600">{user.subscriptionPlan}</span> plan
                  </p>
                </div>
              </div>
              {user.planExpiry && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Renews on</p>
                  <p className="font-semibold">
                    {new Date(user.planExpiry).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Type Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {Object.entries(currentProduct.userTypes).map(([key, userType]) => {
                const UserTypeIcon = iconMap[userType.icon];
                return (
                  <button
                    key={key}
                    onClick={() => setActiveUserType(key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeUserType === key
                        ? 'border-cyan-500 text-cyan-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <UserTypeIcon className="h-5 w-5 mr-3" />
                    {userType.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{currentUserType.name} Plans</h2>
            <p className="text-gray-600">{currentUserType.description}</p>
          </div>

          <div className={`grid gap-6 ${
            currentUserType.plans.length === 2 ? 'lg:grid-cols-2' : 
            currentUserType.plans.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-1'
          }`}>
            {currentUserType.plans.map((plan, index) => (
              <PlanCard 
                key={index} 
                plan={plan} 
                userType={activeUserType}
                product={productId}
              />
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 text-sm">All paid plans come with a 14-day free trial. No credit card required to start.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I get a refund?</h3>
              <p className="text-gray-600 text-sm">We offer a 30-day money-back guarantee for all annual subscriptions.</p>
            </div>
          </div>
        </div>
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

export default ProductPlans;