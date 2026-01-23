import React, { useState } from 'react';

const StudentDetailsForm = ({
  formData,
  handleChange,
  addSkill,
  removeSkill,
  addInterest,
  removeInterest,
  handleResumeUpload,
  fileInputRef,
  isUploading,
  uploadProgress,
  filesToUpload
}) => {
  const [tempSkill, setTempSkill] = useState('');
  const [tempInterest, setTempInterest] = useState('');

  const handleAddSkill = () => {
    if (tempSkill.trim()) {
      addSkill(tempSkill.trim());
      setTempSkill('');
    }
  };

  const handleAddInterest = () => {
    if (tempInterest.trim()) {
      addInterest(tempInterest.trim());
      setTempInterest('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Academic Information */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 text-black">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Academic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Institution
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="institution"
              required
              value={formData.institution}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
              placeholder="University/College name"
              disabled={isUploading}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Course/Program
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="course"
              required
              value={formData.course}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
              placeholder="e.g., Computer Science, MBA"
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Year of Study</label>
            <select
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
              disabled={isUploading}
            >
              <option value="">Select year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year">5th Year</option>
              <option value="Graduate">Graduate</option>
              <option value="Post-Graduate">Post-Graduate</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Graduation Year</label>
            <input
              type="number"
              name="graduationYear"
              min="2023"
              max="2030"
              value={formData.graduationYear}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
              placeholder="2024"
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">GPA/CGPA</label>
            <input
              type="text"
              name="gpa"
              value={formData.gpa}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
              placeholder="e.g., 3.8/4.0"
              disabled={isUploading}
            />
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Technical Skills</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={tempSkill}
              onChange={(e) => setTempSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="Add a skill (e.g., Python, React, Data Analysis)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-black"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-sm"
              disabled={isUploading}
            >
              Add Skill
            </button>
          </div>
          
          {formData.skills.length > 0 && (
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

      {/* Interests Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Career Interests</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={tempInterest}
              onChange={(e) => setTempInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
              placeholder="Add an interest (e.g., AI Research, Product Management)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-black"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition shadow-sm"
              disabled={isUploading}
            >
              Add Interest
            </button>
          </div>
          
          {formData.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {formData.interests.map((interest, index) => (
                <div
                  key={index}
                  className="bg-white border border-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(index)}
                    className="text-purple-600 hover:text-purple-800"
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

      {/* Portfolio & Resume */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Portfolio & Resume</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">GitHub Profile</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                github.com/
              </span>
              <input
                type="text"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-black"
                placeholder="yourusername"
                disabled={isUploading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Portfolio/LinkedIn</label>
            <input
              type="url"
              name="portfolioUrl"
              value={formData.portfolioUrl}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-black"
              placeholder="https://yourportfolio.com"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Resume Upload */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Resume/CV</label>
          <div className="flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 transition text-black">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-700">
                  {filesToUpload.resume ? filesToUpload.resume.name : 
                   formData.resume ? 'Resume uploaded' : 'Upload your resume'}
                </p>
                <p className="text-sm text-gray-500">PDF or DOCX (max 10MB)</p>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleResumeUpload}
              accept=".pdf,.doc,.docx"
              className="hidden"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
              disabled={isUploading}
            >
              {filesToUpload.resume || formData.resume ? 'Change' : 'Upload'}
            </button>
          </div>
          
          {isUploading && filesToUpload.resume && (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading form...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Achievements & Extracurriculars</h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Achievements</label>
          <textarea
            name="achievements"
            value={formData.achievements}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none text-black"
            placeholder="List any awards, projects, publications, or extracurricular activities..."
            disabled={isUploading}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsForm;