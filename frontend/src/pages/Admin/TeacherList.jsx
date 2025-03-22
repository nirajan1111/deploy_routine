import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import TeacherForm from './TeacherForm';

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/teachers?limit=100&offset=0');
      setTeachers(response.data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      // Use mock data for demonstration
      setTeachers([
        { email: 'john.doe@example.com', name: 'John Doe', department: 'Computer Science', designation: 'Professor' },
        { email: 'jane.smith@example.com', name: 'Jane Smith', department: 'Mathematics', designation: 'Associate Professor' },
        { email: 'bob.johnson@example.com', name: 'Bob Johnson', department: 'Physics', designation: 'Assistant Professor' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setCurrentTeacher(teacher);
    setShowForm(true);
  };

  const handleDelete = async (email) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await axios.delete(`http://localhost:8080/teachers/${email}`);
        setTeachers(teachers.filter(t => t.email !== email));
      } catch (error) {
        console.error('Error deleting teacher:', error);
        alert('Failed to delete teacher. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (teacherData) => {
    try {
      if (currentTeacher) {
        await axios.put(`http://localhost:8080/teachers/${currentTeacher.email}`, teacherData);
      } else {
        await axios.post('http://localhost:8080/teachers', teacherData);
      }
      setShowForm(false);
      setCurrentTeacher(null);
      fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      alert('Failed to save teacher. Please try again.');
    }
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {showForm ? (
        <TeacherForm 
          teacher={currentTeacher} 
          onSubmit={handleFormSubmit} 
          onCancel={() => {
            setShowForm(false);
            setCurrentTeacher(null);
          }}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-semibold mb-2 sm:mb-0">Teacher List</h2>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative w-full sm:w-64">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  className="pl-10 pr-4 py-2 border rounded-md w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center space-x-2"
                onClick={() => {
                  setCurrentTeacher(null);
                  setShowForm(true);
                }}
              >
                <FaPlus />
                <span>Add Teacher</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher) => (
                      <tr key={teacher.email}>
                        <td className="py-4 px-4 text-sm">{teacher.name}</td>
                        <td className="py-4 px-4 text-sm">{teacher.email}</td>
                        <td className="py-4 px-4 text-sm">{teacher.department}</td>
                        <td className="py-4 px-4 text-sm">{teacher.designation}</td>
                        <td className="py-4 px-4 text-sm text-right">
                          <button
                            className="text-blue-600 hover:text-blue-800 mr-3"
                            onClick={() => handleEdit(teacher)}
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDelete(teacher.email)}
                          >
                            <FaTrash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                        No teachers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherList;