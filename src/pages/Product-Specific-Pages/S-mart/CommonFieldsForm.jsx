import React from 'react';

const CommonFieldsForm = ({ formData, handleChange }) => {
  return (
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
  );
};

export default CommonFieldsForm;