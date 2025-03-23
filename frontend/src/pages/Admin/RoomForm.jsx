import React, { useState, useEffect } from 'react';

const RoomForm = ({ room, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    room_code: '',
    block_no: '',
    floor_no: 1,
    screen_available: false,
    department: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (room) {
      setFormData({
        room_code: room.room_code || '',
        block_no: room.block_no || '',
        floor_no: room.floor_no || 1,
        screen_available: room.screen_available || false,
        department: room.department || ''
      });
    }
  }, [room]);

  const validate = () => {
    const newErrors = {};
    if (!formData.room_code.trim()) newErrors.room_code = 'Room code is required';
    if (!formData.block_no.trim()) newErrors.block_no = 'Block number is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (formData.floor_no < 1) newErrors.floor_no = 'Floor number must be at least 1';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        floor_no: parseInt(formData.floor_no)
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{room ? 'Edit Room' : 'Add New Room'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Code
            </label>
            <input
              type="text"
              name="room_code"
              value={formData.room_code}
              onChange={handleChange}
              className={`w-full bg-white  px-3 py-2 border rounded-md ${errors.room_code ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., A101"
            />
            {errors.room_code && <p className="mt-1 text-sm text-red-500">{errors.room_code}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Block
            </label>
            <input
              type="text"
              name="block_no"
              value={formData.block_no}
              onChange={handleChange}
              className={`w-full bg-white  px-3 py-2 border rounded-md ${errors.block_no ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., A"
            />
            {errors.block_no && <p className="mt-1 text-sm text-red-500">{errors.block_no}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor Number
            </label>
            <input
              type="number"
              name="floor_no"
              min="1"
              value={formData.floor_no}
              onChange={handleChange}
              className={`w-full bg-white  px-3 py-2 border rounded-md ${errors.floor_no ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.floor_no && <p className="mt-1 text-sm text-red-500">{errors.floor_no}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full bg-white  px-3 py-2 border rounded-md ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Department</option>
              <option value="DOECE">Department of Electronics and Computer Engineering</option>
          
            </select>
            {errors.department && <p className="mt-1 text-sm text-red-500">{errors.department}</p>}
          </div>
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="screen_available"
              checked={formData.screen_available}
              onChange={handleChange}
              className="h-4 w-4 bg-white  text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="ml-2 bg-white  text-sm text-gray-700">Screen Available</span>
          </label>
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
            {room ? 'Update Room' : 'Add Room'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomForm;