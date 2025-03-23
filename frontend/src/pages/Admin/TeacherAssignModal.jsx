import React, { useState } from 'react';
import { FaPlus, FaTimes, FaUserMinus } from 'react-icons/fa';

const TeacherAssignModal = ({ subject, teachers, assignedTeachers, onAssign, onRemove, onClose }) => {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  console.log(assignedTeachers)
  const availableTeachers = teachers.filter(
    teacher => !assignedTeachers.some(assigned => assigned.email === teacher.email)
  );

  const handleAssign = () => {
    if (selectedTeacher) {
      onAssign(selectedTeacher);
      setSelectedTeacher('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Manage Teachers for {subject.name} ({subject.subject_code})
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3">Assigned Teachers</h3>
        {assignedTeachers.length === 0 ? (
          <p className="text-gray-500 italic">No teachers assigned to this subject yet.</p>
        ) : (
          <div className="space-y-2">
            {assignedTeachers.map(teacher => (
              <div 
                key={teacher.teacher_email} 
                className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <p className="font-medium">{teacher.teacher_name}</p>
                  <p className="text-sm text-gray-500">{teacher.teacher_email}</p>
                </div>
                <button
                  onClick={() => onRemove(teacher.teacher_email)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove teacher from subject"
                >
                  <FaUserMinus size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Assign New Teacher</h3>
        <div className="flex space-x-2">
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md"
          >
            <option value="">Select a teacher</option>
            {availableTeachers.map(teacher => (
              <option key={teacher.email} value={teacher.email}>
              {teacher.designation}  {teacher.teacher_name} 
              </option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={!selectedTeacher}
            className={`px-4 py-2 rounded-md flex items-center ${
              !selectedTeacher 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <FaPlus className="mr-2" />
            Assign
          </button>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TeacherAssignModal;