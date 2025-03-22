import React, { useState, useEffect } from 'react';

const StudentGroupForm = ({ group, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    program: '',
    year_enrolled: new Date().getFullYear(),
    group_name: '',
    department: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        program: group.program || '',
        year_enrolled: group.year_enrolled || new Date().getFullYear(),
        group_name: group.group_name || '',
        department: group.department || ''
      });
    }
  }, [group]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Group name is required';
    if (!formData.program.trim()) newErrors.program = 'Program code is required';
    if (!formData.year_enrolled) newErrors.year_enrolled = 'Year enrolled is required';
    if (!formData.group_name.trim()) newErrors.group_name = 'Group identifier is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year_enrolled' ? parseInt(value) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{group ? 'Edit Student Group' : 'Add New Student Group'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., Computer Science Year 1"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Code
            </label>
            <input
              type="text"
              name="program"
              value={formData.program}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.program ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., CS, MATH, PHY"
              maxLength={10}
            />
            {errors.program && <p className="mt-1 text-sm text-red-500">{errors.program}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year Enrolled
            </label>
            <select
              name="year_enrolled"
              value={formData.year_enrolled}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.year_enrolled ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Year</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {errors.year_enrolled && <p className="mt-1 text-sm text-red-500">{errors.year_enrolled}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Identifier
            </label>
            <input
              type="text"
              name="group_name"
              value={formData.group_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.group_name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., A, B, C"
              maxLength={2}
            />
            {errors.group_name && <p className="mt-1 text-sm text-red-500">{errors.group_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Engineering">Engineering</option>
              <option value="Arts">Arts</option>
            </select>
            {errors.department && <p className="mt-1 text-sm text-red-500">{errors.department}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {group ? 'Update Group' : 'Add Group'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentGroupForm;