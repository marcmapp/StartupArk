import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JobPostings = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedPostType, setSelectedPostType] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalHirings: 0,
    activeHirings: 0,
    closedOffers: 0,
    shortlisted: 0,
    applications: 0,
    interviewStage: 0
  });

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem('token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
  };

  // Fetch dashboard data and opportunities
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      // Get own startup profile to get startupId
      const profileRes = await axios.get(`${baseUrl}/startupark/api/profile/startup`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const startupId = profileRes.data?.profile?._id;

      const opportunitiesRes = await axios.get(`${baseUrl}/startupark/api/opportunities`, {
        headers: { Authorization: `Bearer ${token}` },
        params: startupId ? { startupId } : {}
      });

      const opps = opportunitiesRes.data.opportunities || [];
      setOpportunities(opps);

      // Compute stats from list
      setDashboardStats({
        totalHirings: opps.length,
        activeHirings: opps.filter(o => o.status === 'active').length,
        closedOffers: opps.filter(o => o.status === 'closed').length,
        shortlisted: 0,
        applications: opps.reduce((sum, o) => sum + (o.applicationCount || 0), 0),
        interviewStage: 0
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createOpportunity = async (formData) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await axios.post(`${baseUrl}/startupark/api/opportunities`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOpportunities(prev => [response.data, ...prev]);
      setActiveView('dashboard');
      setSelectedPostType(null);
      
      // Refresh dashboard stats
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create opportunity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOpportunity = async (id, updateData) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await axios.put(`${baseUrl}/startupark/api/opportunities/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOpportunities(prev => 
        prev.map(opp => opp._id === id ? response.data : opp)
      );
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update opportunity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteOpportunity = async (id) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      await axios.delete(`${baseUrl}/startupark/api/opportunities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOpportunities(prev => prev.filter(opp => opp._id !== id));
      
      // Refresh dashboard stats
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete opportunity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Navigate to applications management
  const handleStatClick = (status) => {
    navigate('/startupark/startup-applications', { state: { filter: status } });
  };

  const DashboardView = () => (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Talent Dashboard</h1>
          <p className=" mt-2">Manage your hiring pipeline and opportunities</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/startupark/startup-applications')}
            className="px-6 py-3 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:bg-zinc-900 transition-colors font-medium"
          >
            View Applications
          </button>
          <button 
            onClick={() => setActiveView('create')}
            className="px-6 py-3 border-2 border-cyan-600 hover:border-orange-600 rounded-xl transition-colors font-medium shadow-sm"
          >
            + Create Opportunity
          </button>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div 
          className="p-6 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatClick('all')}
        >
          <div className="text-2xl font-semibold ">{dashboardStats.totalHirings}</div>
          <div className="text-sm  mt-1">Total Hirings</div>
        </div>
        <div 
          className="p-6 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatClick('active')}
        >
          <div className="text-2xl font-semibold text-green-600">{dashboardStats.activeHirings}</div>
          <div className="text-sm  mt-1">Active</div>
        </div>
        <div 
          className="p-6 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatClick('closed')}
        >
          <div className="text-2xl font-semibold ">{dashboardStats.closedOffers}</div>
          <div className="text-sm  mt-1">Closed</div>
        </div>
        <div 
          className="p-6 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatClick('shortlisted')}
        >
          <div className="text-2xl font-semibold text-blue-600">{dashboardStats.shortlisted}</div>
          <div className="text-sm  mt-1">Shortlisted</div>
        </div>
        <div 
          className="p-6 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatClick('pending')}
        >
          <div className="text-2xl font-semibold text-purple-600">{dashboardStats.applications}</div>
          <div className="text-sm  mt-1">Applications</div>
        </div>
        <div 
          className="p-6 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatClick('interview')}
        >
          <div className="text-2xl font-semibold text-orange-600">{dashboardStats.interviewStage}</div>
          <div className="text-sm  mt-1">In Interview</div>
        </div>
      </div>

      {/* Recent Opportunities */}
      <div className="rounded-lg border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-white/10">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Recent Opportunities</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className=" mt-2">Loading opportunities...</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💼</div>
              <p className=" mb-4">No opportunities created yet</p>
              <button 
                onClick={() => setActiveView('create')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Opportunity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map((opportunity) => (
                <div 
                  key={opportunity._id}
                  onClick={() => {
                    setEditingPost(opportunity);
                    setActiveView('detail');
                  }}
                  className="border border-gray-200 dark:border-white/10 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-zinc-900 dark:text-white">{opportunity.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      opportunity.status === 'active' ? 'bg-green-100 text-green-800' :
                      opportunity.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                    }`}>
                      {opportunity.status}
                    </span>
                  </div>
                  <p className="text-sm  mb-2 capitalize">{opportunity.type} • {opportunity.location}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Created {new Date(opportunity.createdAt).toLocaleDateString()} • 
                    {opportunity.applicationCount || 0} applications
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ... (PostTypeSelector, PostForm, and PostDetailView components remain the same as your original code)
  const PostTypeSelector = () => (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={() => setActiveView('dashboard')}
          className="flex items-center  hover:text-zinc-900 dark:text-white mr-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-light text-zinc-900 dark:text-white">Create New Opportunity</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {[
          { type: 'job', title: 'Job Position', desc: 'Full-time or part-time employment', icon: '💼' },
          { type: 'internship', title: 'Internship', desc: 'Paid or unpaid internship program', icon: '🎓' },
          { type: 'course', title: 'Course', desc: 'Educational course or training', icon: '📚' },
          { type: 'freelance', title: 'Freelance Project', desc: 'Project-based contract work', icon: '⚡' }
        ].map((item) => (
          <div
            key={item.type}
            onClick={() => setSelectedPostType(item.type)}
            className="border-2 border-gray-200 dark:border-white/10 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="text-3xl mb-4">{item.icon}</div>
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">{item.title}</h3>
            <p className="text-sm ">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const PostForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      category: '',
      location: '',
      description: '',
      requirements: '',
      type: selectedPostType,
      status: 'draft',
      ...(selectedPostType === 'internship' && { internshipType: 'paid' }),
      ...(selectedPostType === 'course' && { price: '' })
    });

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e, status = 'active') => {
      e.preventDefault();
      try {
        setSubmitting(true);
        setError(null);
        
        if (status === 'active') {
          if (!formData.title.trim()) {
            setError('Title is required for publishing');
            return;
          }
          if (!formData.description.trim()) {
            setError('Description is required for publishing');
            return;
          }
          if (!formData.category) {
            setError('Category is required for publishing');
            return;
          }
          if (!formData.location) {
            setError('Location is required for publishing');
            return;
          }
          if (selectedPostType === 'course' && !formData.price) {
            setError('Price is required for courses');
            return;
          }
        }

        await createOpportunity({ ...formData, status });
      } catch (err) {
        // Error is handled in createOpportunity
      } finally {
        setSubmitting(false);
      }
    };

    const handleSaveDraft = async (e) => {
      await handleSubmit(e, 'draft');
    };

    const handlePublish = async (e) => {
      await handleSubmit(e, 'active');
    };

    return (
      <div className="p-8">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => setSelectedPostType(null)}
            className="flex items-center  hover:text-zinc-900 dark:text-white mr-4"
          >
            ← Back to Selection
          </button>
          <h1 className="text-2xl font-light text-zinc-900 dark:text-white">
            Create {selectedPostType === 'job' ? 'Job Position' : 
                   selectedPostType === 'internship' ? 'Internship' :
                   selectedPostType === 'course' ? 'Course' : 'Freelance Project'}
          </h1>
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

        <form onSubmit={handlePublish} className="max-w-4xl rounded-lg border border-gray-200 dark:border-white/10 p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Title *
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter position title..."
                disabled={submitting}
              />
            </div>
            
            {selectedPostType === 'internship' && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Internship Type *
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select 
                  value={formData.internshipType}
                  onChange={(e) => setFormData({...formData, internshipType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={submitting}
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="stipend">Stipend-based</option>
                </select>
              </div>
            )}
            
            {selectedPostType === 'course' && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Price ($) *
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input 
                  type="number" 
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter course price..."
                  disabled={submitting}
                  min="0"
                  step="0.01"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Category *
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={submitting}
              >
                <option value="">Select category</option>
                <option value="technology">Technology</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="business">Business</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Location *
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={submitting}
              >
                <option value="">Select location</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Description *
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea 
              rows="4"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter detailed description..."
              disabled={submitting}
            />
          </div>
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Requirements</label>
            <textarea 
              rows="3"
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="List the requirements..."
              disabled={submitting}
            />
          </div>
          
          <div className="flex gap-4 justify-between">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              <p>Fields marked with <span className="text-red-500">*</span> are required for publishing</p>
            </div>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={handleSaveDraft}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-gray-50 dark:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Save Draft'}
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Publishing...' : 'Publish Opportunity'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  const PostDetailView = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(editingPost);
    const [updating, setUpdating] = useState(false);

    const handleSave = async () => {
      try {
        setUpdating(true);
        setError(null);
        const updatedPost = await updateOpportunity(editingPost._id, editData);
        setEditingPost(updatedPost);
        setIsEditing(false);
        fetchDashboardData();
      } catch (err) {
        // Error is handled in updateOpportunity
      } finally {
        setUpdating(false);
      }
    };

    const handleDelete = async () => {
      if (window.confirm('Are you sure you want to delete this opportunity?')) {
        try {
          await deleteOpportunity(editingPost._id);
          setActiveView('dashboard');
        } catch (err) {
          // Error is handled in deleteOpportunity
        }
      }
    };

    if (!editingPost) return null;

    return (
      <div className="p-8 bg-black  ">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button 
              onClick={() => setActiveView('dashboard')}
              className="flex items-center  hover:text-zinc-900 dark:text-white mr-6"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-light text-zinc-900 dark:text-white">Opportunity Details</h1>
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-gray-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-900 transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
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

        <div className="max-w-4xl rounded-lg border border-gray-200 dark:border-white/10 p-8 shadow-sm">
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Title</label>
                  <input 
                    type="text" 
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={updating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Status</label>
                  <select 
                    value={editData.status}
                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={updating}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Description</label>
                <textarea 
                  rows="4"
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={updating}
                />
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={handleSave}
                  disabled={updating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  disabled={updating}
                  className="px-6 py-2 border border-gray-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-gray-50 dark:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">{editingPost.title}</h2>
                  <div className="flex items-center gap-4 text-sm ">
                    <span className="capitalize">{editingPost.type}</span>
                    <span>•</span>
                    <span className="capitalize">{editingPost.category}</span>
                    <span>•</span>
                    <span className="capitalize">{editingPost.location}</span>
                    {editingPost.internshipType && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{editingPost.internshipType} internship</span>
                      </>
                    )}
                    {editingPost.price && (
                      <>
                        <span>•</span>
                        <span>${editingPost.price}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  editingPost.status === 'active' ? 'bg-green-100 text-green-800' :
                  editingPost.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                }`}>
                  {editingPost.status}
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-white/10 pt-6">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">Description</h3>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{editingPost.description}</p>
              </div>

              {editingPost.requirements && (
                <div className="border-t border-gray-200 dark:border-white/10 pt-6">
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">Requirements</h3>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{editingPost.requirements}</p>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-white/10 pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="">Type</div>
                    <div className="font-medium capitalize">{editingPost.type}</div>
                  </div>
                  <div>
                    <div className="">Created</div>
                    <div className="font-medium">{new Date(editingPost.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="">Applications</div>
                    <div className="font-medium">{editingPost.applicationCount || 0}</div>
                  </div>
                  <div>
                    <div className="">Location</div>
                    <div className="font-medium capitalize">{editingPost.location}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen min-w-full overflow-auto p-6 -m-6">
      {activeView === 'dashboard' && <DashboardView />}
      {activeView === 'create' && !selectedPostType && <PostTypeSelector />}
      {activeView === 'create' && selectedPostType && <PostForm />}
      {activeView === 'detail' && <PostDetailView />}
    </div>
  );
};

export default JobPostings;