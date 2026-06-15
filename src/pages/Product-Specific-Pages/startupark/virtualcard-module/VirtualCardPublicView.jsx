import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FiExternalLink, 
  FiLinkedin, 
  FiTwitter, 
  FiFacebook,
  FiMail,
  FiPhone,
  FiGlobe
} from 'react-icons/fi';
import QRCode from 'react-qr-code';
import Loader from '../../../../components/Loader';

const VirtualCardPublicView = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/startupark/api/virtual-card/${id}`);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load virtual card');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!data) return <div className="text-center py-8">Virtual card not found</div>;

  const { startup, virtualCard } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{startup.companyName || startup.startupName}</h1>
              <p className="text-blue-100">{startup.tagline}</p>
            </div>
            {startup.logo && (
              <img 
                src={startup.logo} 
                alt="Logo" 
                className="h-16 w-16 rounded-full object-cover border-2 border-white"
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">About</h2>
                <p className="text-gray-600">{startup.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Industry</h3>
                  <p>{startup.industry}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p>
                    {(typeof startup.location === 'object'
                      ? [startup.location?.city, startup.location?.state].filter(Boolean).join(', ')
                      : startup.location) || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Founded</h3>
                  <p>{startup.foundedYear}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Stage</h3>
                  <p>{startup.fundingStage}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Contact */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-3">Contact</h2>
                <div className="space-y-3">
                  {startup.website && (
                    <div className="flex items-center">
                      <FiGlobe className="text-gray-500 mr-2" />
                      <a 
                        href={startup.website} 
                        target="_blank" 
                        rel="noopener"
                        className="text-blue-600 hover:underline"
                      >
                        {startup.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  {startup.email && (
                    <div className="flex items-center">
                      <FiMail className="text-gray-500 mr-2" />
                      <a 
                        href={`mailto:${startup.email}`}
                        className="text-gray-800 hover:text-blue-600"
                      >
                        {startup.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <QRCode 
                    value={`${window.location.origin}/vc/${virtualCard.shareId}`}
                    size={128}
                    level="H"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Scan to save this contact
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Viewed {virtualCard.viewCount} times
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-500 hover:text-blue-600">
              <FiLinkedin size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-400">
              <FiTwitter size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-800">
              <FiFacebook size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualCardPublicView;