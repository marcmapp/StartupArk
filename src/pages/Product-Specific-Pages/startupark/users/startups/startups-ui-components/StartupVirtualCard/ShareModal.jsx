import React from 'react';
import { FiCopy, FiDownload, FiTwitter, FiLinkedin, FiFacebook, FiX } from 'react-icons/fi';

const ShareModal = ({ isOpen, onClose, vcData, startupData, onCopy, onDownload, copied }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Share Virtual Card</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Share Link
            </label>
            <div className="flex">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/vc/${vcData?._id}`}
                className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-transparent focus:ring-zinc-400/40 dark:focus:ring-white/20 text-xs sm:text-sm border p-2 truncate"
              />
              <button
                onClick={onCopy}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100"
              >
                <FiCopy className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            {copied && (
              <p className="mt-1 text-xs sm:text-sm text-green-600">Copied to clipboard!</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <button
              onClick={onDownload}
              className="flex items-center justify-center px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiDownload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Download Image
            </button>

            <div className="flex justify-center sm:justify-end space-x-2">
              <button className="p-1 sm:p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
                <FiTwitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button className="p-1 sm:p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">
                <FiLinkedin className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button className="p-1 sm:p-2 rounded-full bg-blue-800 text-white hover:bg-blue-900">
                <FiFacebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          <div className="pt-3 sm:pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1 sm:px-4 sm:py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;