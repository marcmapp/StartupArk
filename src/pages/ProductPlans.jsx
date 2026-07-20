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

        // Subscriptions are per-product, keyed by productId (e.g. "startupArk").
        // The server already lazily expires stale subscriptions on this read.
        const sub = subscriptionRes.data.subscriptions?.[productId];
        const userData = {
          ...userRes.data,
          subscriptionPlan: sub?.status === "active" ? sub.plan : null,
          planExpiry: sub?.status === "active" ? sub.expiryDate : null,
        };

        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate, productId]);

  // The backend already activates the subscription (payment-verify for paid
  // plans, update-plan for free ones) before this fires — just reflect the
  // result locally instead of making a second, unverified update-plan call.
  const handlePaymentSuccess = (subscriptionPlan, subscriptions) => {
    const sub = subscriptions?.[productId];
    setUser((prev) => ({
      ...prev,
      subscriptionPlan: sub?.plan || subscriptionPlan,
      planExpiry: sub?.expiryDate || null,
    }));

    setModalMessage("Payment Successful! Subscription updated.");
    setShowModal(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
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
      (user.subscriptionPlan?.endsWith("Pro") && plan.name.endsWith("Free"));

    return (
      <div className={`glass-card relative p-8 transition-all duration-300 ${
        plan.popular ? 'border-zinc-400 dark:border-white/30 scale-[1.02]' : 'hover:border-zinc-400/60 dark:hover:border-white/20'
      }`}>
        {/* Popular Badge */}
        {plan.popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center shadow-md">
              <StarIcon className="h-3 w-3 mr-1" />
              Most Popular
            </div>
          </div>
        )}

        {/* Current Plan Badge */}
        {isCurrentPlan && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center shadow-md">
              <CheckIcon className="h-3 w-3 mr-1" />
              Current Plan
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{plan.name}</h3>
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-3xl font-bold text-zinc-900 dark:text-white">{plan.price}</span>
            {plan.amount > 0 && <span className="text-zinc-500 dark:text-zinc-400 text-sm">/month</span>}
          </div>
          {plan.amount > 0 && (
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">billed monthly</p>
          )}
        </div>

        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{feature}</span>
            </li>
          ))}
        </ul>

        <MarkPayment
          amount={plan.amount}
          plan={plan.name}
          product={product}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          disabled={isDisabled}
          user={user}
          buttonText={isCurrentPlan ? "Current Plan" : plan.cta}
          className={isCurrentPlan ? 'btn-ghost w-full py-3 opacity-60 cursor-not-allowed' : plan.popular ? 'btn-mono w-full py-3' : 'btn-ghost w-full py-3'}
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
            className="flex items-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Products
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-xl glass-inset flex items-center justify-center">
                <ProductIcon className="h-10 w-10 text-zinc-700 dark:text-zinc-200" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {currentProduct.name} Plans
                </h1>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                  {currentProduct.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Subscription Status */}
        {isActivePlan && (
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 glass-inset rounded-xl flex items-center justify-center">
                  <CheckIcon className="h-6 w-6 text-zinc-700 dark:text-zinc-200" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Active Subscription</h2>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    You're subscribed to <span className="font-semibold text-zinc-900 dark:text-white">{currentProduct.name}</span> as{" "}
                    <span className="font-semibold text-zinc-900 dark:text-white">{user.startuparkRole || 'User'}</span> with the{" "}
                    <span className="font-semibold text-zinc-900 dark:text-white">{user.subscriptionPlan}</span> plan
                  </p>
                </div>
              </div>
              {user.planExpiry && (
                <div className="text-right">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Renews on</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {new Date(user.planExpiry).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Type Tabs */}
        <div className="mb-8">
          <div className="border-b border-zinc-200 dark:border-white/10">
            <nav className="-mb-px flex space-x-8">
              {Object.entries(currentProduct.userTypes).map(([key, userType]) => {
                const UserTypeIcon = iconMap[userType.icon];
                return (
                  <button
                    key={key}
                    onClick={() => setActiveUserType(key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeUserType === key
                        ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                        : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-white/20'
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
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{currentUserType.name} Plans</h2>
            <p className="text-zinc-600 dark:text-zinc-400">{currentUserType.description}</p>
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
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Can I change plans anytime?</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">We accept all major credit/debit cards, UPI, and net banking via Razorpay.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Is billing recurring?</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">Paid plans run for one month per purchase. You'll need to renew manually — automatic recurring billing isn't set up yet.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Questions about a charge?</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">Reach out to support and we'll sort it out directly — there's no self-serve refund flow yet.</p>
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