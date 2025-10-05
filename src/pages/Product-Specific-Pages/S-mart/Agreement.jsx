import React from 'react';
import axios from 'axios';

const terms = {
  user: 'User Terms and Conditions: Please read and accept these terms to proceed with the setup. These include your responsibilities, data policies, and usage agreement for using our services as a user.',
  startup: 'Startup Terms and Conditions: Please review and accept these terms to proceed. These include partnership obligations, service level agreements, and data usage guidelines.'
};

const baseUrl = import.meta.env.VITE_API_BASE_URL;

function Agreement({ role, onAgree }) {
  const token = localStorage.getItem('token');

  const handleAgree = () => {
    axios
      .post(`${baseUrl}/smart/api/smart/agreement/${role}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => onAgree());
  };

  return (
    <div className="bg-white max-w-2xl mx-auto p-8 rounded-xl shadow-2xl text-gray-800">
      <h2 className="text-3xl font-bold mb-4 text-center">{role.toUpperCase()} Terms & Conditions</h2>
      <div className="bg-gray-100 p-4 rounded-md mb-6 max-h-60 overflow-y-auto border border-gray-300">
        <p className="whitespace-pre-wrap text-gray-700">{terms[role]}</p>
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleAgree}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all"
        >
          I Agree & Continue
        </button>
      </div>
    </div>
  );
}

export default Agreement;
