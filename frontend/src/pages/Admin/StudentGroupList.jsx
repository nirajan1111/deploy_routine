import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUsers } from 'react-icons/fa';
import StudentGroupForm from './StudentGroupForm';

const StudentGroupList = () => {
  const [studentGroups, setStudentGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudentGroups();
  }, []);

  const fetchStudentGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/student-sections?limit=100&offset=0');
      setStudentGroups(response.data || []);
    } catch (error) {
      console.error('Error fetching student groups:', error);
      // Use mock data for demonstration
      setStudentGroups([
        { id: 1, name: 'Computer Science Year 1', program: 'CS', year_enrolled: 2023, group_name: 'A', department: 'Computer Science' },
        { id: 2, name: 'Mathematics Year 2', program: 'MATH', year_enrolled: 2022, group_name: 'B', department: 'Mathematics' },
        { id: 3, name: 'Physics Year 3', program: 'PHY', year_enrolled: 2021, group_name: 'C', department: 'Physics' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (group) => {
    setCurrentGroup(group);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student group?')) {
      try {
        await axios.delete(`http://localhost:8080/student-sections/${id}`);
        setStudentGroups(studentGroups.filter(g => g.id !== id));
      } catch (error) {
        console.error('Error deleting student group:', error);
        alert('Failed to delete student group. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (groupData) => {
    try {
      if (currentGroup) {
        await axios.put(`http://localhost:8080/student-sections/${currentGroup.id}`, groupData);
      } else {
        await axios.post('http://localhost:8080/student-sections', groupData);
      }
      setShowForm(false);
      setCurrentGroup(null);
      fetchStudentGroups();
    } catch (error) {
      console.error('Error saving student group:', error);
      alert('Failed to save student group. Please try again.');
    }
  };

  const handleViewStudents = (groupId) => {
    // You could implement a modal or navigate to a detailed view
    alert(`Viewing students for group ID: ${groupId}`);
  };

  const filteredGroups = studentGroups.filter(group =>
    group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.program?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {showForm ? (
        <StudentGroupForm
          group={currentGroup}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setCurrentGroup(null);
          }}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-semibold mb-2 sm:mb-0">Student Groups</h2>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative w-full sm:w-64">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  className="pl-10 pr-4 py-2 border rounded-md w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center space-x-2"
                onClick={() => {
                  setCurrentGroup(null);
                  setShowForm(true);
                }}
              >
                <FaPlus />
                <span>Add Group</span>
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
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => (
                      <tr key={group.id}>
                        <td className="py-4 px-4 text-sm">{group.name}</td>
                        <td className="py-4 px-4 text-sm">{group.program}</td>
                        <td className="py-4 px-4 text-sm">{group.year_enrolled}</td>
                        <td className="py-4 px-4 text-sm">{group.group_name}</td>
                        <td className="py-4 px-4 text-sm">{group.department}</td>
                        <td className="py-4 px-4 text-sm text-right">
                          <button
                            className="text-green-600 hover:text-green-800 mr-3"
                            onClick={() => handleViewStudents(group.id)}
                            title="View Students"
                          >
                            <FaUsers size={18} />
                          </button>
                          <button
                            className="text-blue-600 hover:text-blue-800 mr-3"
                            onClick={() => handleEdit(group)}
                            title="Edit Group"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDelete(group.id)}
                            title="Delete Group"
                          >
                            <FaTrash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                        No student groups found
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

export default StudentGroupList;