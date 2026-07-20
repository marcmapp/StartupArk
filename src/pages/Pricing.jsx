import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Icon mapping
const iconMap = {
  BuildingStorefrontIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BuildingOfficeIcon
};

const Pricing = () => {
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
          axios.get(`${baseUrl}/api/mappuser/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/api/mappuser/subscription`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Subscriptions are per-product; the server already lazily expires
        // stale ones on this read. Surface the first active one, if any.
        const subscriptions = subscriptionRes.data.subscriptions || {};
        const activeEntry = Object.entries(subscriptions).find(([, s]) => s?.status === "active");
        const userData = {
          ...userRes.data,
          subscriptionPlan: activeEntry ? activeEntry[1].plan : null,
          planExpiry: activeEntry ? activeEntry[1].expiryDate : null,
        };

        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleViewPlans = (productKey) => {
    navigate(`/pricing/${productKey}`);
  };

  if (!user) {
    return <Loader />;
  }

  const isActivePlan = user.subscriptionPlan && user.subscriptionPlan !== "No Subscription";

  const ProductCard = ({ productKey, product }) => {
    const ProductIcon = iconMap[product.icon];
    const userTypesCount = Object.keys(product.userTypes).length;
    const totalPlans = Object.values(product.userTypes).reduce(
      (total, userType) => total + userType.plans.length, 0
    );

    return (
      <div className="glass-card p-8 transition-all duration-300 hover:border-zinc-400/60 dark:hover:border-white/20">
        <div className="text-center mb-6">
          <div className="w-16 h-16 glass-inset rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ProductIcon className="h-8 w-8 text-zinc-700 dark:text-zinc-200" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{product.name}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">{product.description}</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Plan Types:</span>
            <span className="font-semibold text-zinc-900 dark:text-white">{userTypesCount} user types</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Total Plans:</span>
            <span className="font-semibold text-zinc-900 dark:text-white">{totalPlans} plans available</span>
          </div>
        </div>

        <button
          onClick={() => handleViewPlans(productKey)}
          className="btn-mono w-full py-3"
        >
          View Plans
          <ArrowRightIcon className="h-4 w-4 ml-2" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard-style Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-xl glass-inset flex items-center justify-center">
                <UserCircleIcon className="h-10 w-10 text-zinc-700 dark:text-zinc-200" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                  Welcome back, {user.username || user.email}!
                </h1>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                  Choose a product to explore subscription plans
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
                    You're subscribed to <span className="font-semibold text-zinc-900 dark:text-white">Startup Ark</span> as{" "}
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

        {/* Products Grid */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Choose Your Product</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Select a product to view detailed pricing plans tailored for different user types and needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {Object.entries(pricingConfig.products).map(([key, product]) => (
              <ProductCard key={key} productKey={key} product={product} />
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

export default Pricing;