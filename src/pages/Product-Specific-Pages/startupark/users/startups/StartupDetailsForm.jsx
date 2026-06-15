import React from 'react';

const StartupDetailsForm = ({
  formData,
  handleChange,
  handleArrayChange,
  handleLogoUpload,
  handleGalleryUpload,
  handlePitchDeckUpload,
  handleTeamAvatarUpload,
  updateGalleryCaption,
  removeGalleryImage,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  fileInputRef,
  galleryInputRef,
  pitchDeckInputRef,
  isUploading,
  uploadProgress,
  filesToUpload,
  baseUrl
}) => {
  const isBlobUrl = (url) => {
    return url && typeof url === 'string' && (url.startsWith('blob:') || url.startsWith('http'));
  };

  return (
    <>
      <div className='text-zinc-900 dark:text-white space-y-8'>
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Startup Logo<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex items-center space-x-4">
            {formData.logo ? (
              <div className="relative">
                <img 
                  src={isBlobUrl(formData.logo) ? formData.logo : `https://pub-96dbf4700a544b3b825b262291f6f0a7.r2.dev/${formData.logo}`}
                  alt="Startup logo" 
                  className="h-20 w-20 rounded-lg object-cover border border-black/[0.06] dark:border-white/10"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, logo: null }));
                    setFilesToUpload(prev => ({ ...prev, logo: null }));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  disabled={isUploading}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="h-20 w-20 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border-2 border-dashed border-black/10 dark:border-white/15 flex items-center justify-center">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="px-4 py-2 bg-black/[0.04] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
                disabled={isUploading}
              >
                {formData.logo ? 'Change Logo' : 'Upload Logo'}
              </button>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Recommended: 500x500px, Max 5MB (JPEG, PNG, GIF, WebP)
              </p>
              {filesToUpload.logo && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  ✓ Ready: {filesToUpload.logo.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Startup basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Startup Name<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="startupName"
              required
              value={formData.startupName}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Tagline<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="tagline"
              required
              value={formData.tagline}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="Briefly describe your startup in one line"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* About sections */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Description<span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="What problem does your startup solve?"
              disabled={isUploading}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Bio<span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="bio"
              required
              value={formData.bio}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="Tell us about your startup's journey"
              disabled={isUploading}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Mission</label>
            <textarea
              name="mission"
              value={formData.mission}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="What is your startup's mission?"
              disabled={isUploading}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Vision</label>
            <textarea
              name="vision"
              value={formData.vision}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="What is your startup's long-term vision?"
              disabled={isUploading}
            ></textarea>
          </div>
        </div>

        {/* Solution details */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Solution Details</h3>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Problem Statement</label>
            <textarea
              name="problemStatement"
              value={formData.problemStatement}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="Describe the problem you're solving in detail"
              disabled={isUploading}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Unique Proposition</label>
            <textarea
              name="uniqueProposition"
              value={formData.uniqueProposition}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="What makes your solution unique?"
              disabled={isUploading}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Technology Stack (comma separated)</label>
            <input
              type="text"
              name="technologyStack"
              value={formData.technologyStack.join(', ')}
              onChange={handleArrayChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="React, Node.js, MongoDB, etc."
              disabled={isUploading}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.technologyStack.map((tech, index) => (
                <span key={index} className="glass-inset text-zinc-700 dark:text-zinc-200 text-xs px-3 py-1 rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Business details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Industry<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="industry"
              required
              value={formData.industry}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Business Model</label>
            <input
              type="text"
              name="businessModel"
              value={formData.businessModel}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="How does your startup make money?"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="City, Country"
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Founded Year</label>
            <input
              type="number"
              name="foundedYear"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.foundedYear}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Team Size</label>
            <select
              name="teamSize"
              value={formData.teamSize}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              disabled={isUploading}
            >
              <option value="">Select</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="200+">200+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Funding Stage</label>
            <select
              name="fundingStage"
              value={formData.fundingStage}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              disabled={isUploading}
            >
              <option value="">Select</option>
              <option value="Bootstrapped">Bootstrapped</option>
              <option value="Pre-seed">Pre-seed</option>
              <option value="Seed">Seed</option>
              <option value="Series A">Series A</option>
              <option value="Series B+">Series B+</option>
            </select>
          </div>
        </div>

        {/* Website & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="https://"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="+1 (123) 456-7890"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">LinkedIn</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="https://linkedin.com/company/your-startup"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Twitter</label>
            <input
              type="url"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="https://twitter.com/your-startup"
              disabled={isUploading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Facebook</label>
            <input
              type="url"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              className="w-full border border-black/10 dark:border-white/15 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/40 dark:ring-white/20"
              placeholder="https://facebook.com/your-startup"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Pitch Deck */}
        <div>
          <label className="block text-sm font-semibold mb-2">Pitch Deck</label>
          <div className="flex items-center space-x-4">
            {formData.pitchDeck && formData.pitchDeck !== 'pending' ? (
              <div className="flex items-center">
                <svg className="h-10 w-10 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="ml-2 text-sm">Pitch Deck Uploaded</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, pitchDeck: null }));
                    setFilesToUpload(prev => ({ ...prev, pitchDeck: null }));
                  }}
                  className="ml-4 text-red-500 hover:text-red-700"
                  disabled={isUploading}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">No file selected</span>
              </div>
            )}
            <div>
              <input
                type="file"
                ref={pitchDeckInputRef}
                onChange={handlePitchDeckUpload}
                accept=".pdf,.ppt,.pptx"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => pitchDeckInputRef.current.click()}
                className="px-4 py-2 bg-black/[0.04] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
                disabled={isUploading}
              >
                {formData.pitchDeck && formData.pitchDeck !== 'pending' ? 'Change File' : 'Upload Pitch Deck'}
              </button>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">PDF or PowerPoint (max 10MB)</p>
              {filesToUpload.pitchDeck && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  ✓ Ready: {filesToUpload.pitchDeck.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div>
          <label className="block text-sm font-semibold mb-2">Gallery Images</label>
          <input
            type="file"
            ref={galleryInputRef}
            onChange={handleGalleryUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => galleryInputRef.current.click()}
            className="px-4 py-2 bg-black/[0.04] dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.08] mb-4"
            disabled={isUploading}
          >
            Add Images
          </button>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Upload product screenshots, team photos, etc. (Max 5MB each, JPEG, PNG, GIF, WebP)
          </p>
          {filesToUpload.gallery.length > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2">
              ✓ {filesToUpload.gallery.length} image(s) ready for upload
            </p>
          )}

          {formData.gallery.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.gallery.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={isBlobUrl(image.url) ? image.url : `https://pub-96dbf4700a544b3b825b262291f6f0a7.r2.dev/${image.url}`}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <input
                    type="text"
                    value={image.caption}
                    onChange={(e) => updateGalleryCaption(index, e.target.value)}
                    placeholder="Add caption"
                    className="w-full mt-1 text-xs border border-black/10 dark:border-white/15 rounded px-2 py-1"
                    disabled={isUploading}
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isUploading}
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Members */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-semibold">Team Members</label>
            <button
              type="button"
              onClick={addTeamMember}
              className="btn-mono px-3 py-1 text-xs"
              disabled={isUploading}
            >
              Add Team Member
            </button>
          </div>

          {formData.team.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No team members added yet</p>
          ) : (
            <div className="space-y-4">
              {formData.team.map((member, index) => (
                <div key={index} className="border border-black/[0.06] dark:border-white/10 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-3 md:col-span-1">
                      {member.profilePhoto ? (
                        <img
                          src={isBlobUrl(member.profilePhoto) ? member.profilePhoto : `https://pub-96dbf4700a544b3b825b262291f6f0a7.r2.dev/${member.profilePhoto}`}
                          alt={`${member.name}'s avatar`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-400">
                            {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                      )}
                      <input
                        type="file"
                        id={`team-avatar-${index}`}
                        onChange={(e) => handleTeamAvatarUpload(e, index)}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById(`team-avatar-${index}`).click()}
                        className="text-xs text-zinc-900 dark:text-white hover:underline"
                        disabled={isUploading}
                      >
                        {member.profilePhoto ? 'Change' : 'Add Photo'}
                      </button>
                    </div>
                    <div className="md:col-span-3 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Name</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                            className="w-full border border-black/10 dark:border-white/15 rounded px-3 py-1 text-sm"
                            placeholder="Full name"
                            disabled={isUploading}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Position</label>
                          <input
                            type="text"
                            value={member.position}
                            onChange={(e) => updateTeamMember(index, 'position', e.target.value)}
                            className="w-full border border-black/10 dark:border-white/15 rounded px-3 py-1 text-sm"
                            placeholder="Role/Title"
                            disabled={isUploading}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Bio</label>
                        <textarea
                          value={member.bio}
                          onChange={(e) => updateTeamMember(index, 'bio', e.target.value)}
                          className="w-full border border-black/10 dark:border-white/15 rounded px-3 py-1 text-sm h-16"
                          placeholder="Brief background"
                          disabled={isUploading}
                        ></textarea>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeTeamMember(index)}
                          className="text-xs text-red-500 hover:text-red-700"
                          disabled={isUploading}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default StartupDetailsForm;