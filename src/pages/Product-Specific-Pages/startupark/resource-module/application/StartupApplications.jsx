import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const StartupApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
const [stats, setStats] = useState({
  pending: 0,
  reviewed: 0,
  shortlisted: 0,
  interview: 0,
  accepted: 0,
  rejected: 0,
  total: 0,
  recent: 0
});
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [notes, setNotes] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem('token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
  };

  // Initialize filter from navigation state
  useEffect(() => {
    if (location.state?.filter) {
      setFilter(location.state.filter);
    }
  }, [location.state]);

  // Fetch applications and stats
  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [filter, currentPage]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await axios.get(`${baseUrl}/startupark/api/startup/applications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: filter === 'all' ? null : filter,
          page: currentPage,
          limit: 10
        }
      });

      setApplications(response.data.applications);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch applications');
      console.error('Applications fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

const fetchStats = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${baseUrl}/startupark/api/startup/applications/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Ensure all stats fields have values
    const statsData = response.data;
    setStats({
      pending: statsData.pending || 0,
      reviewed: statsData.reviewed || 0,
      shortlisted: statsData.shortlisted || 0,
      interview: statsData.interview || 0,
      accepted: statsData.accepted || 0,
      rejected: statsData.rejected || 0,
      total: statsData.total || 0,
      recent: statsData.recent || 0
    });
  } catch (err) {
    console.error('Stats fetch error:', err);
  }
};

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      setUpdatingStatus(applicationId);
      setError('');
      const token = getAuthToken();

      await axios.put(
        `${baseUrl}/startupark/api/startup/applications/${applicationId}/status`,
        { status, notes: notes || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh data
      await Promise.all([fetchApplications(), fetchStats()]);
      
      if (selectedApplication && selectedApplication._id === applicationId) {
        setSelectedApplication(prev => ({ ...prev, status }));
      }

      setNotes('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const viewApplicationDetails = async (applicationId) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${baseUrl}/startupark/api/startup/applications/${applicationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedApplication(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch application details');
    }
  };

  const downloadResume = (resumeKey) => {
    if (resumeKey) {
      window.open(`${baseUrl}/startupark/api/student/file/${encodeURIComponent(resumeKey)}`, '_blank');
    }
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: 'bg-blue-100 text-blue-800', text: 'Pending' },
      reviewed: { color: 'bg-yellow-100 text-yellow-800', text: 'Under Review' },
      shortlisted: { color: 'bg-purple-100 text-purple-800', text: 'Shortlisted' },
      interview: { color: 'bg-orange-100 text-orange-800', text: 'Interview' },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const StatusButton = ({ status, applicationId, currentStatus }) => {
    const isActive = status === currentStatus;
    const isUpdating = updatingStatus === applicationId;
    
    const statusColors = {
      pending: 'bg-blue-600 hover:bg-blue-700',
      reviewed: 'bg-yellow-600 hover:bg-yellow-700',
      shortlisted: 'bg-purple-600 hover:bg-purple-700',
      interview: 'bg-orange-600 hover:bg-orange-700',
      accepted: 'bg-green-600 hover:bg-green-700',
      rejected: 'bg-red-600 hover:bg-red-700'
    };

    return (
      <button
        onClick={() => updateApplicationStatus(applicationId, status)}
        disabled={isActive || isUpdating}
        className={`px-3 py-1 text-xs text-white rounded transition-colors ${
          isActive 
            ? 'bg-gray-400 cursor-not-allowed' 
            : `${statusColors[status]} ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`
        }`}
      >
        {isUpdating ? 'Updating...' : status.charAt(0).toUpperCase() + status.slice(1)}
      </button>
    );
  };

  const ApplicationCard = ({ application }) => (
    <div className="rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {application.opportunityId?.title}
          </h3>
          <div className="flex items-center gap-4 text-sm  mb-2">
            <span className="font-medium">
              {application.studentId?.name || 'Unknown Student'}
            </span>
            <span>•</span>
            <span>{application.studentId?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="capitalize">{application.opportunityId?.type}</span>
            <span>•</span>
            <span className="capitalize">{application.opportunityId?.category}</span>
            <span>•</span>
            <span className="capitalize">{application.opportunityId?.location}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={application.status} />
          <span className="text-xs">
            Applied {new Date(application.appliedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {application.coverLetter && (
        <p className="text-sm mb-4 line-clamp-2">
          {application.coverLetter}
        </p>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => viewApplicationDetails(application._id)}
            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            View Details
          </button>
          {application.resume && (
            <button
              onClick={() => downloadResume(application.resume)}
              className="px-3 py-1 text-xs border border-blue-300 text-blue-700 rounded hover:bg-blue-50 transition-colors"
            >
              Download Resume
            </button>
          )}
        </div>
        
        <div className="flex gap-1">
          <StatusButton status="reviewed" applicationId={application._id} currentStatus={application.status} />
          <StatusButton status="shortlisted" applicationId={application._id} currentStatus={application.status} />
          <StatusButton status="interview" applicationId={application._id} currentStatus={application.status} />
          <StatusButton status="accepted" applicationId={application._id} currentStatus={application.status} />
          <StatusButton status="rejected" applicationId={application._id} currentStatus={application.status} />
        </div>
      </div>
    </div>
  );

  const ApplicationDetailModal = () => {
    if (!selectedApplication) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {selectedApplication.opportunityId?.title}
                </h2>
                <p className="">{selectedApplication.opportunityId?.startupName}</p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover: transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Applicant Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicant Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{selectedApplication.studentId?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedApplication.studentId?.email}</p>
                  </div>
                  {selectedApplication.studentId?.whatsappNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedApplication.studentId.whatsappNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={selectedApplication.status} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Applied Date</label>
                    <p className="text-gray-900">
                      {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="text-gray-900">
                      {new Date(selectedApplication.lastStatusUpdate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            {selectedApplication.coverLetter && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cover Letter</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                </div>
              </div>
            )}

            {/* Resume */}
            {selectedApplication.resume && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Resume</h3>
                <button
                  onClick={() => downloadResume(selectedApplication.resume)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download Resume
                </button>
              </div>
            )}

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Internal Notes</h3>
              <textarea
                value={notes || selectedApplication.notes || ''}
                onChange={(e) => setNotes(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Add internal notes about this applicant..."
              />
            </div>

            {/* Status Update */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Status</h3>
              <div className="flex gap-2 flex-wrap">
                <StatusButton status="reviewed" applicationId={selectedApplication._id} currentStatus={selectedApplication.status} />
                <StatusButton status="shortlisted" applicationId={selectedApplication._id} currentStatus={selectedApplication.status} />
                <StatusButton status="interview" applicationId={selectedApplication._id} currentStatus={selectedApplication.status} />
                <StatusButton status="accepted" applicationId={selectedApplication._id} currentStatus={selectedApplication.status} />
                <StatusButton status="rejected" applicationId={selectedApplication._id} currentStatus={selectedApplication.status} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FilterButton = ({ status, count, isActive, onClick }) => {
    const statusColors = {
      all: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      pending: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      reviewed: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      shortlisted: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      interview: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      accepted: 'bg-green-100 text-green-800 hover:bg-green-200',
      rejected: 'bg-red-100 text-red-800 hover:bg-red-200'
    };

    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          isActive ? 'ring-2 ring-offset-2 ring-blue-500' : ''
        } ${statusColors[status]}`}
      >
        {status === 'all' ? 'All Applications' : status.charAt(0).toUpperCase() + status.slice(1)}
        <span className="ml-2 bg-opacity-50 px-2 py-1 rounded-full text-xs">
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen min-w-full overflow-auto -m-6 p-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Applications Management</h1>
          <p className="mt-2">Review and manage all job applications</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
        <FilterButton 
          status="all" 
          count={stats.total} 
          isActive={filter === 'all'} 
          onClick={() => setFilter('all')} 
        />
        <FilterButton 
          status="pending" 
          count={stats.pending} 
          isActive={filter === 'pending'} 
          onClick={() => setFilter('pending')} 
        />
        <FilterButton 
          status="reviewed" 
          count={stats.reviewed} 
          isActive={filter === 'reviewed'} 
          onClick={() => setFilter('reviewed')} 
        />
        <FilterButton 
          status="shortlisted" 
          count={stats.shortlisted} 
          isActive={filter === 'shortlisted'} 
          onClick={() => setFilter('shortlisted')} 
        />
        <FilterButton 
          status="interview" 
          count={stats.interview} 
          isActive={filter === 'interview'} 
          onClick={() => setFilter('interview')} 
        />
        <FilterButton 
          status="accepted" 
          count={stats.accepted} 
          isActive={filter === 'accepted'} 
          onClick={() => setFilter('accepted')} 
        />
        <FilterButton 
          status="rejected" 
          count={stats.rejected} 
          isActive={filter === 'rejected'} 
          onClick={() => setFilter('rejected')} 
        />
      </div>

      {/* Applications List */}
      <div className=" rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {filter === 'all' ? 'All Applications' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Applications`}
            <span className="text-gray-500 text-sm font-normal ml-2">
              ({applications.length} of {stats[filter === 'all' ? 'total' : filter]})
            </span>
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className=" mt-2">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className=" mb-4">No applications found</p>
              <p className="text-gray-500 text-sm">
                {filter === 'all' 
                  ? "You haven't received any applications yet." 
                  : `No applications with status "${filter}" found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <ApplicationCard key={application._id} application={application} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm ">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      <ApplicationDetailModal />
    </div>
  );
};

export default StartupApplications;