import React, { useState } from 'react';

const SectionCard = ({ title, children }) => (
  <div className="glass-inset p-6">
    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">{title}</h3>
    {children}
  </div>
);

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
    <div className="text-zinc-900 dark:text-white space-y-6">
      {/* Profession & Experience */}
      <SectionCard title="Professional Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Profession<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text" name="profession" required
              value={formData.profession} onChange={handleChange}
              className="input-mono" placeholder="e.g., Software Engineer, Investor"
              disabled={isUploading}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Experience</label>
            <select
              name="experience" value={formData.experience} onChange={handleChange}
              className="input-mono" disabled={isUploading}
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
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Education</label>
          <input
            type="text" name="education" value={formData.education} onChange={handleChange}
            className="input-mono" placeholder="e.g., MBA, Computer Science" disabled={isUploading}
          />
        </div>
      </SectionCard>

      {/* Skills */}
      <SectionCard title="Skills & Expertise">
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text" value={tempSkill} onChange={(e) => setTempSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a skill (e.g., JavaScript, Finance, Marketing)"
              className="input-mono flex-1" disabled={isUploading}
            />
            <button type="button" onClick={handleAddSkill} className="btn-mono px-6" disabled={isUploading}>
              Add
            </button>
          </div>
          {formData.skills && formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {formData.skills.map((skill, index) => (
                <div key={index} className="glass-inset text-zinc-700 dark:text-zinc-200 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                  {skill}
                  <button type="button" onClick={() => removeSkill(index)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white" disabled={isUploading}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Social Links */}
      <SectionCard title="Social Profiles">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">LinkedIn</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 text-sm">
                linkedin.com/in/
              </span>
              <input
                type="text" name="linkedin" value={formData.linkedin} onChange={handleChange}
                className="input-mono flex-1 rounded-l-none border-l-0" placeholder="your-profile" disabled={isUploading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Twitter</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 text-sm">
                twitter.com/
              </span>
              <input
                type="text" name="twitter" value={formData.twitter} onChange={handleChange}
                className="input-mono flex-1 rounded-l-none border-l-0" placeholder="@yourhandle" disabled={isUploading}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Areas of Interest */}
      <SectionCard title="Areas of Interest">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Industry Interests (comma separated)</label>
          <input
            type="text" name="expertise" value={formData.expertise.join(', ')} onChange={handleArrayChange}
            className="input-mono" placeholder="FinTech, HealthTech, AI, Clean Energy, etc." disabled={isUploading}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.expertise.map((interest, index) => (
              <span key={index} className="glass-inset text-zinc-700 dark:text-zinc-200 px-3 py-1 rounded-full text-sm">{interest}</span>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Upload Progress */}
      {isUploading && (
        <div className="p-4 glass-inset">
          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            <span>Uploading form data…</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-black/[0.06] dark:bg-white/10 rounded-full h-2">
            <div className="bg-zinc-900 dark:bg-white h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailsForm;
