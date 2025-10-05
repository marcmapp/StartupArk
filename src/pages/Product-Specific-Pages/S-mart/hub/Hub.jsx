import React, { useState } from 'react';

const HubPage = () => {
  const [userType, setUserType] = useState(null);
  const [studentActiveTab, setStudentActiveTab] = useState('dashboard');
  const [investorActiveTab, setInvestorActiveTab] = useState('dashboard');

  const studentTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'internships', label: 'Internships', icon: '💼' },
    { id: 'jobs', label: 'Jobs', icon: '🔍' }
  ];

  const investorTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📈' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'opportunities', label: 'Opportunities', icon: '🚀' }
  ];

  const StudentDashboard = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Profile Completion</h3>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">75% complete</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Applications</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
          <p className="text-sm text-gray-600">Active applications</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Upcoming Interviews</h3>
          <p className="text-3xl font-bold text-green-600">3</p>
          <p className="text-sm text-gray-600">This week</p>
        </div>
      </div>
    </div>
  );

  const StudentInternships = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Internships</h2>
      <div className="space-y-4">
        {[1, 2, 3].map(item => (
          <div key={item} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-blue-600">Software Development Intern</h3>
            <p className="text-gray-600">Tech Company Inc. • Remote • $25/hr</p>
            <p className="text-sm text-gray-500 mt-2">3 months • Full-time • Immediate start</p>
            <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const StudentJobs = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Job Opportunities</h2>
      <div className="space-y-4">
        {[1, 2, 3].map(item => (
          <div key={item} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-green-600">Junior Developer</h3>
            <p className="text-gray-600">Startup XYZ • San Francisco • $80,000/year</p>
            <p className="text-sm text-gray-500 mt-2">Full-time • Requires 1+ years experience</p>
            <button className="mt-3 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const InvestorDashboard = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Investor Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Portfolio Value</h3>
          <p className="text-3xl font-bold text-purple-600">$2.4M</p>
          <p className="text-sm text-green-600">+12.5% this quarter</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Active Investments</h3>
          <p className="text-3xl font-bold text-blue-600">8</p>
          <p className="text-sm text-gray-600">Companies in portfolio</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Pending Deals</h3>
          <p className="text-3xl font-bold text-orange-600">3</p>
          <p className="text-sm text-gray-600">Awaiting approval</p>
        </div>
      </div>
    </div>
  );

  const InvestorPortfolio = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Investment Portfolio</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[1, 2, 3, 4].map(item => (
              <tr key={item} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Tech Startup {item}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${(item * 250000).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${item % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item % 2 === 0 ? '+' : ''}{item * 15}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const InvestorOpportunities = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Investment Opportunities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(item => (
          <div key={item} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-purple-600">AI Startup {item}</h3>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Series {item}</span>
            </div>
            <p className="text-gray-600 mb-3">Revolutionary AI technology for healthcare</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Funding Goal:</span>
                <span className="font-medium">${(item * 2)}M</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Valuation:</span>
                <span className="font-medium">${(item * 10)}M</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Industry:</span>
                <span className="font-medium">Healthcare AI</span>
              </div>
            </div>
            <button className="mt-4 w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStudentContent = () => {
    switch (studentActiveTab) {
      case 'dashboard': return <StudentDashboard />;
      case 'internships': return <StudentInternships />;
      case 'jobs': return <StudentJobs />;
      default: return <StudentDashboard />;
    }
  };

  const renderInvestorContent = () => {
    switch (investorActiveTab) {
      case 'dashboard': return <InvestorDashboard />;
      case 'portfolio': return <InvestorPortfolio />;
      case 'opportunities': return <InvestorOpportunities />;
      default: return <InvestorDashboard />;
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to CareerHub</h1>
            <p className="text-xl text-gray-600">Choose your path to get started</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              onClick={() => setUserType('student')}
            >
              <div className="text-6xl mb-4">🎓</div>
              <h2 className="text-3xl font-bold text-blue-600 mb-4">Student</h2>
              <p className="text-gray-600 mb-6">Find internships, jobs, and kickstart your career journey</p>
              <ul className="text-left text-gray-500 space-y-2">
                <li>• Browse internships and jobs</li>
                <li>• Track applications</li>
                <li>• Connect with employers</li>
                <li>• Career resources</li>
              </ul>
              <button className="mt-6 bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors text-lg font-semibold">
                Enter as Student
              </button>
            </div>

            <div 
              className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              onClick={() => setUserType('investor')}
            >
              <div className="text-6xl mb-4">💼</div>
              <h2 className="text-3xl font-bold text-purple-600 mb-4">Investor</h2>
              <p className="text-gray-600 mb-6">Discover investment opportunities and manage your portfolio</p>
              <ul className="text-left text-gray-500 space-y-2">
                <li>• View investment opportunities</li>
                <li>• Manage portfolio</li>
                <li>• Track performance</li>
                <li>• Connect with startups</li>
              </ul>
              <button className="mt-6 bg-purple-500 text-white px-8 py-3 rounded-lg hover:bg-purple-600 transition-colors text-lg font-semibold">
                Enter as Investor
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                {userType === 'student' ? '🎓 Student Hub' : '💼 Investor Hub'}
              </h1>
            </div>
            <button 
              onClick={() => setUserType(null)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Switch User Type
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {(userType === 'student' ? studentTabs : investorTabs).map((tab) => (
              <button
                key={tab.id}
                onClick={() => userType === 'student' 
                  ? setStudentActiveTab(tab.id) 
                  : setInvestorActiveTab(tab.id)
                }
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  (userType === 'student' ? studentActiveTab === tab.id : investorActiveTab === tab.id)
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {userType === 'student' ? renderStudentContent() : renderInvestorContent()}
      </main>
    </div>
  );
};

export default HubPage;