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
      <div className="relative rounded-2xl p-8 transition-all duration-300 border border-gray-200/80 backdrop-blur-sm hover:border-cyan-300/50 hover:shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ProductIcon className="h-8 w-8 text-cyan-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-4">{product.description}</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Plan Types:</span>
            <span className="font-semibold">{userTypesCount} user types</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Plans:</span>
            <span className="font-semibold">{totalPlans} plans available</span>
          </div>
        </div>

        <button
          onClick={() => handleViewPlans(productKey)}
          className="w-full py-3 px-6 bg-cyan-600 text-white rounded-xl font-semibold transition-all duration-200 hover:bg-cyan-700 hover:shadow-lg flex items-center justify-center"
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
              <div className="h-16 w-16 rounded-xl bg-cyan-100 flex items-center justify-center border border-cyan-200">
                <UserCircleIcon className="h-10 w-10 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Welcome back, <span className="text-cyan-600">{user.username || user.email}</span>!
                </h1>
                <p className="mt-1 text-gray-600">
                  Choose a product to explore subscription plans
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
                    You're subscribed to <span className="font-semibold text-cyan-600">Startup Ark</span> as{" "}
                    <span className="font-semibold text-blue-600">{user.smartRole || 'User'}</span> with the{" "}
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

        {/* Products Grid */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Choose Your Product</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
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

export default Pricing;