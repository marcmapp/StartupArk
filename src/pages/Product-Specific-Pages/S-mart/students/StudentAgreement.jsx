import React from 'react';
import axios from 'axios';

const studentTerms = `Student Terms and Conditions: 

As a student on our platform, you agree to:
1. Use the platform for educational and networking purposes only
2. Maintain academic integrity in all interactions
3. Respect intellectual property rights
4. Engage professionally with startups and other users
5. Keep your profile information accurate and up-to-date

By agreeing, you acknowledge that you are currently enrolled in an educational institution and will use this platform to enhance your learning experience and career opportunities.`;

const baseUrl = import.meta.env.VITE_API_BASE_URL;

function StudentAgreement({ onAgree }) {
  const token = localStorage.getItem('token');

  const handleAgree = () => {
    axios
      .post(`${baseUrl}/smart/api/smart/agreement/student`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => onAgree());
  };

  return (
    <div className="bg-white max-w-2xl mx-auto p-8 rounded-xl shadow-2xl text-gray-800">
      <h2 className="text-3xl font-bold mb-4 text-center">STUDENT Terms & Conditions</h2>
      <div className="bg-gray-100 p-4 rounded-md mb-6 max-h-60 overflow-y-auto border border-gray-300">
        <p className="whitespace-pre-wrap text-gray-700">{studentTerms}</p>
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

export default StudentAgreement;