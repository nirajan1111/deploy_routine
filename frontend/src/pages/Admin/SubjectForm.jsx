import React, { useState, useEffect } from 'react';

const SubjectForm = ({ subject, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    subject_code: '',
    name: '',
    department: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (subject) {
      setFormData({
        subject_code: subject.subject_code || '',
        name: subject.name || '',
        department: subject.department || ''
      });
    }
  }, [subject]);

  const validate = () => {
    const newErrors = {};
    if (!formData.subject_code.trim()) newErrors.subject_code = 'Subject code is required';
    if (!formData.name.trim()) newErrors.name = 'Subject name is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{subject ? 'Edit Subject' : 'Add New Subject'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Code
            </label>
            <input
              type="text"
              name="subject_code"
              value={formData.subject_code}
              onChange={handleChange}
              className={`w-full px-3 py-2 border bg-white  rounded-md ${errors.subject_code ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., CS101"
            />
            {errors.subject_code && <p className="mt-1 text-sm text-red-500">{errors.subject_code}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border bg-white rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., Introduction to Programming"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-3 bg-white  py-2 border rounded-md ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Department</option>
              <option value="DOECE">Department of Electronics and computer Engineering</option>
            
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
            {subject ? 'Update Subject' : 'Add Subject'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubjectForm;