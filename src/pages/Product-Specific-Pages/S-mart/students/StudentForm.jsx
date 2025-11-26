import React, { useState } from 'react';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

function StudentForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    course: '',
    yearOfStudy: '',
    skills: [],
    interests: [],
    bio: ''
  });

  const [tempSkill, setTempSkill] = useState('');
  const [tempInterest, setTempInterest] = useState('');

  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (tempSkill.trim() && !formData.skills.includes(tempSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, tempSkill.trim()]
      }));
      setTempSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addInterest = () => {
    if (tempInterest.trim() && !formData.interests.includes(tempInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, tempInterest.trim()]
      }));
      setTempInterest('');
    }
  };

  const removeInterest = (index) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${baseUrl}/smart/api/smart/form/student`, 
        { formData }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSubmit();
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit form');
    }
  };

  return (
    <div className="bg-white max-w-2xl mx-auto p-8 rounded-xl shadow-2xl text-gray-800">
      <h2 className="text-3xl font-bold mb-6 text-center">Complete Your Student Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Common Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Your Name*</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Email*</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Student Specific Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Institution*</label>
            <input
              type="text"
              name="institution"
              required
              value={formData.institution}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your school/college/university"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Course*</label>
            <input
              type="text"
              name="course"
              required
              value={formData.course}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your field of study"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Year of Study*</label>
          <select
            name="yearOfStudy"
            required
            value={formData.yearOfStudy}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
            <option value="Graduate">Graduate</option>
            <option value="Post-Graduate">Post-Graduate</option>
          </select>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-semibold mb-2">Skills</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tempSkill}
              onChange={(e) => setTempSkill(e.target.value)}
              placeholder="Add a skill"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-semibold mb-2">Interests</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tempInterest}
              onChange={(e) => setTempInterest(e.target.value)}
              placeholder="Add an interest"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
            />
            <button
              type="button"
              onClick={addInterest}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.interests.map((interest, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                {interest}
                <button
                  type="button"
                  onClick={() => removeInterest(index)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Bio*</label>
          <textarea
            name="bio"
            required
            value={formData.bio}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tell us about your academic background, career goals, and what you hope to achieve on this platform..."
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-all"
        >
          Complete Profile
        </button>
      </form>
    </div>
  );
}

export default StudentForm;
