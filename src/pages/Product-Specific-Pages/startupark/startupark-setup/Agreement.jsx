import React from 'react';
import axios from 'axios';

const terms = {
  user: `User Terms and Conditions

As a User on Startupark, you agree to:

1. Use the platform for legitimate networking, investment, and mentorship purposes only
2. Respect the intellectual property rights of all startups and users
3. Maintain professional conduct in all communications
4. Provide accurate and truthful information in your profile
5. Respect the privacy and confidentiality of other users
6. Not engage in any fraudulent, deceptive, or illegal activities
7. Comply with all applicable laws and regulations

Platform Rights:
- Startupark reserves the right to verify user information
- We may remove content that violates our policies
- We can suspend or terminate accounts for violations
- Platform features and availability may change over time

Data Usage:
- Your profile information will be visible to other users as per your privacy settings
- We use your data to provide personalized recommendations
- We may send you relevant updates and opportunities

By agreeing, you acknowledge that you have read and understood these terms and agree to be bound by them.`,

  startup: `Startup Terms and Conditions

As a Startup on Startupark, you agree to:

1. Provide accurate and up-to-date information about your startup
2. Only list products/services that you legally own or have rights to
3. Maintain transparency about your funding status and business model
4. Respect intellectual property rights of others
5. Provide truthful information to potential investors and partners
6. Not engage in misleading or deceptive practices
7. Comply with all applicable business laws and regulations

Startup Commitments:
- Keep your startup information current and accurate
- Respond to legitimate inquiries from users and investors
- Maintain professional conduct in all platform interactions
- Disclose any conflicts of interest appropriately

Platform Rules:
- Startupark may verify your business information
- We reserve the right to feature or highlight startups
- Platform takes no responsibility for investment decisions
- We may remove startups that violate our policies

Intellectual Property:
- You retain ownership of your intellectual property
- You grant Startupark limited rights to display your content
- You are responsible for ensuring you have necessary rights

By agreeing, you confirm your startup meets our eligibility criteria and agree to maintain professional standards.`,

  student: `Student Terms and Conditions

As a Student on Startupark, you agree to:

1. Use the platform for legitimate educational and career development purposes
2. Maintain academic integrity in all interactions
3. Provide accurate information about your educational background
4. Respect intellectual property rights of startups and other users
5. Engage professionally with startups and mentors
6. Not misuse internship or project opportunities
7. Comply with your educational institution's policies

Student Commitments:
- Use your real identity and educational information
- Maintain professional conduct in all communications
- Respect the time and expertise of mentors and startup founders
- Complete assigned tasks professionally if accepted for opportunities

Platform Usage:
- Startupark connects you with legitimate opportunities
- We verify student status with educational institutions when necessary
- Platform is not responsible for academic credit decisions
- We may remove students who violate our policies

Privacy & Data:
- Your academic information is used for matching with opportunities
- We share your profile with startups you apply to
- You control what information is publicly visible
- Educational records are handled confidentially

Eligibility Requirements:
- Must be currently enrolled in an educational institution
- Must use your institutional email when possible
- Must maintain good academic standing
- Must be at least 18 years old (or have parental consent)

By agreeing, you confirm you are a current student and will use this platform to enhance your learning and career opportunities.`
};

const baseUrl = import.meta.env.VITE_API_BASE_URL;

function Agreement({ role, onAgree }) {
  const token = localStorage.getItem('token');

  const handleAgree = async () => {
    try {
      await axios.post(
        `${baseUrl}/startupark/api/startupark/agreement/${role}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      onAgree();
    } catch (error) {
      console.error('Failed to save agreement:', error);
      alert('Failed to save agreement. Please try again.');
    }
  };

  const roleTitles = {
    user: 'User Agreement',
    startup: 'Startup Agreement',
    student: 'Student Agreement'
  };

  return (
    <div className="bg-white max-w-2xl mx-auto p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {roleTitles[role]}
        </h2>
        <p className="text-gray-500 mt-2">Please read and accept the terms to proceed</p>
      </div>

      <div className="mb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-h-96 overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
              {terms[role]}
            </pre>
          </div>
        </div>
        <div className="flex items-center justify-center mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-blue-700">
            By clicking "I Agree", you acknowledge that you have read, understood, and agree to be bound by these terms.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleAgree}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            I Agree & Continue
          </span>
        </button>
        
        <button
          onClick={() => window.print()}
          className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
        >
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Print Terms
          </span>
        </button>
      </div>
    </div>
  );
}

export default Agreement;