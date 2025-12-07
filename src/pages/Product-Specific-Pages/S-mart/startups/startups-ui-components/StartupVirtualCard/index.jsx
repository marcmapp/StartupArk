import React, { useState } from 'react';
import { FiShare2, FiCopy, FiDownload, FiExternalLink } from 'react-icons/fi';
import { FaQrcode } from 'react-icons/fa';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { useVirtualCard } from '../../shared/hooks/useVirtualCard';
import ShareModal from './ShareModal';

const StartupVirtualCard = ({ startupData, baseUrl, isPublicView = false }) => {
  const { vcData, loading, error, createVirtualCard } = useVirtualCard(startupData?._id);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use the virtual card data from props if available (for public view), otherwise use hook data
  const displayVcData = startupData?.virtualCard || vcData;

  const copyToClipboard = () => {
    if (displayVcData) {
      navigator.clipboard.writeText(`${window.location.origin}/vc/${displayVcData._id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadVcImage = () => {
    const vcElement = document.getElementById('virtual-card');
    if (vcElement) {
      html2canvas(vcElement).then(canvas => {
        const link = document.createElement('a');
        link.download = `${startupData.startupName}-virtual-card.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading virtual card...</p>
      </div>
    );
  }

  if (error && !isPublicView) {
    return (
      <div className="p-6 text-center text-red-600">
        Error loading virtual card: {error}
      </div>
    );
  }

  if (!displayVcData && !isPublicView) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto">
          <FaQrcode className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No virtual card yet</h3>
          <p className="mt-1 text-gray-500">
            Create a beautiful digital business card to share with investors and partners.
          </p>
          <div className="mt-6">
            <button
              onClick={createVirtualCard}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Virtual Card
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no virtual card data in public view, show empty state
  if (!displayVcData && isPublicView) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto">
          <FaQrcode className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No virtual card available</h3>
          <p className="mt-1 text-gray-500">
            This startup hasn't created a virtual card yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="space-y-4 sm:space-y-6">
        {!isPublicView && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Your Virtual Card</h2>
            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base"
            >
              <FiShare2 className="mr-1 sm:mr-2" />
              Share
            </button>
          </div>
        )}

        {/* Virtual Card Design */}
        <div
          id="virtual-card"
          className="max-w-xs sm:max-w-md mx-auto border-2 border-black rounded-xl sm:rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div className="max-w-[70%]">
                <h3 className="text-lg sm:text-xl font-bold text-highlight truncate">{startupData.startupName}</h3>
                <p className="text-gray-600 text-sm sm:text-base truncate">{startupData.tagline}</p>
              </div>
              {startupData.logo && (
                <img
                  src={startupData.logo}
                  alt="Logo"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
              )}
            </div>

            <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Industry</p>
                <p className="font-medium text-sm sm:text-base text-secondary">{startupData.industry || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Location</p>
                <p className="font-medium text-sm sm:text-base text-secondary">{startupData.location || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Founded</p>
                <p className="font-medium text-sm sm:text-base text-secondary">{startupData.foundedYear || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Stage</p>
                <p className="font-medium text-sm sm:text-base text-secondary">{startupData.fundingStage || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <p className="text-xs sm:text-sm text-gray-500">Contact</p>
              <p className="font-medium text-sm sm:text-base text-secondary">{startupData.email || 'N/A'}</p>
              {startupData.website && (
                <a
                  href={startupData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline text-xs sm:text-sm truncate block"
                >
                  {startupData.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            <div className="mt-4 sm:mt-6 flex justify-center">
              <QRCode
                value={`${window.location.origin}/vc/${displayVcData._id}`}
                size={96}
                level="H"
              />
            </div>

            <div className="mt-2 sm:mt-4 text-center text-xs text-gray-500">
              Scan to view digital profile
            </div>
          </div>
        </div>

        {/* Share Modal */}
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          vcData={displayVcData}
          startupData={startupData}
          onCopy={copyToClipboard}
          onDownload={downloadVcImage}
          copied={copied}
        />
      </div>
    </div>
  );
};

export default StartupVirtualCard;