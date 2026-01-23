import React, { useState } from 'react';

const UserDetailsForm = ({ formData, handleChange, addSkill, removeSkill, handleArrayChange, isUploading, uploadProgress }) => {
  const [tempSkill, setTempSkill] = useState('');

  const handleAddSkill = () => {
    if (tempSkill.trim()) {
      addSkill(tempSkill.trim());
      setTempSkill('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="text-black space-y-8">
      {/* Profession & Experience */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Professional Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Profession<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="profession"
              required
              value={formData.profession}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="e.g., Software Engineer, Investor"
              disabled={isUploading}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Experience</label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={isUploading}
            >
              <option value="">Select experience level</option>
              <option value="0-2 years">0-2 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="6-10 years">6-10 years</option>
              <option value="10+ years">10+ years</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Education</label>
          <input
            type="text"
            name="education"
            value={formData.education}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="e.g., MBA, Computer Science"
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Skills */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Skills & Expertise</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={tempSkill}
              onChange={(e) => setTempSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a skill (e.g., JavaScript, Finance, Marketing)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-sm"
              disabled={isUploading}
            >
              Add
            </button>
          </div>
          
          {formData.skills && formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {formData.skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-white border border-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-green-600 hover:text-green-800"
                    disabled={isUploading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Social Profiles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">LinkedIn</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                linkedin.com/in/
              </span>
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="your-profile"
                disabled={isUploading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Twitter</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                twitter.com/
              </span>
              <input
                type="text"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="@yourhandle"
                disabled={isUploading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Areas of Interest */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Areas of Interest</h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Industry Interests (comma separated)</label>
          <input
            type="text"
            name="expertise"
            value={formData.expertise.join(', ')}
            onChange={handleArrayChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            placeholder="FinTech, HealthTech, AI, Clean Energy, etc."
            disabled={isUploading}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.expertise.map((interest, index) => (
              <span key={index} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading form data...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailsForm;