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
      <div className="glass-inset p-6 text-zinc-900 dark:text-white">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Academic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Institution
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="institution"
              required
              value={formData.institution}
              onChange={handleChange}
              className="input-mono"
              placeholder="University/College name"
              disabled={isUploading}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Course/Program
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="course"
              required
              value={formData.course}
              onChange={handleChange}
              className="input-mono"
              placeholder="e.g., Computer Science, MBA"
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Year of Study</label>
            <select
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              className="input-mono"
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
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Graduation Year</label>
            <input
              type="number"
              name="graduationYear"
              min="2023"
              max="2030"
              value={formData.graduationYear}
              onChange={handleChange}
              className="input-mono"
              placeholder="2024"
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">GPA/CGPA</label>
            <input
              type="text"
              name="gpa"
              value={formData.gpa}
              onChange={handleChange}
              className="input-mono"
              placeholder="e.g., 3.8/4.0"
              disabled={isUploading}
            />
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="glass-inset p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Technical Skills</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={tempSkill}
              onChange={(e) => setTempSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="Add a skill (e.g., Python, React, Data Analysis)"
              className="input-mono flex-1"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="btn-mono px-6"
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
                  className="glass-inset text-zinc-700 dark:text-zinc-200 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
      <div className="glass-inset p-6 border border-black/10 dark:border-white/15">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Career Interests</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={tempInterest}
              onChange={(e) => setTempInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
              placeholder="Add an interest (e.g., AI Research, Product Management)"
              className="flex-1 px-4 py-3 border border-black/10 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:focus:ring-white/20 focus:border-transparent transition text-zinc-900 dark:text-white"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="btn-mono px-6 py-3"
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
                  className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(index)}
                    className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-700 dark:text-zinc-300"
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
      <div className="glass-inset p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Portfolio & Resume</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">GitHub Profile</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-3 rounded-l-lg border border-r-0 border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400">
                github.com/
              </span>
              <input
                type="text"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="input-mono flex-1 rounded-r-none"
                placeholder="yourusername"
                disabled={isUploading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Portfolio/LinkedIn</label>
            <input
              type="url"
              name="portfolioUrl"
              value={formData.portfolioUrl}
              onChange={handleChange}
              className="input-mono"
              placeholder="https://yourportfolio.com"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Resume Upload */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Resume/CV</label>
          <div className="flex items-center justify-between p-4 border-2 border-dashed border-black/10 dark:border-white/15 rounded-lg hover:border-black/25 dark:hover:border-white/25 transition text-zinc-900 dark:text-white">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center">
                <svg className="h-6 w-6 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-zinc-700 dark:text-zinc-300">
                  {filesToUpload.resume ? filesToUpload.resume.name : 
                   formData.resume ? 'Resume uploaded' : 'Upload your resume'}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">PDF or DOCX (max 10MB)</p>
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
              className="btn-mono px-4 py-2"
              disabled={isUploading}
            >
              {filesToUpload.resume || formData.resume ? 'Change' : 'Upload'}
            </button>
          </div>
          
          {isUploading && filesToUpload.resume && (
            <div className="mt-3">
              <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                <span>Uploading form...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-black/[0.06] dark:bg-white/10 rounded-full h-2">
                <div 
                  className="bg-zinc-900 dark:bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="glass-inset p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Achievements & Extracurriculars</h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Achievements</label>
          <textarea
            name="achievements"
            value={formData.achievements}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border border-black/10 dark:border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none text-zinc-900 dark:text-white"
            placeholder="List any awards, projects, publications, or extracurricular activities..."
            disabled={isUploading}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsForm;