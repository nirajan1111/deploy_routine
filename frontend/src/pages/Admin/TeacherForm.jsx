import React, { useState, useEffect } from 'react';

const TeacherForm = ({ teacher, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name || '',
        email: teacher.email || '',
        department: teacher.department || '',
        designation: teacher.designation || ''
      });
    }
  }, [teacher]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    
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
      <h2 className="text-xl font-semibold mb-6">{teacher ? 'Edit Teacher' : 'Add New Teacher'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full  bg-white  px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter teacher name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-white  px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter email address"
              disabled={!!teacher} // Disable email editing for existing teachers
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-3  bg-white  py-2 border rounded-md ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Department</option>
              <option value="DOECE">Department of Electronics and Computer Engineering</option>
           
            </select>
            {errors.department && <p className="mt-1 text-sm text-red-500">{errors.department}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <select
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className={`w-full bg-white  px-3 py-2 border rounded-md ${errors.designation ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Designation</option>
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Lecturer">Lecturer</option>
              <option value="Teaching Assistant">Teaching Assistant</option>
            </select>
            {errors.designation && <p className="mt-1 text-sm text-red-500">{errors.designation}</p>}
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
            {teacher ? 'Update Teacher' : 'Add Teacher'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherForm;