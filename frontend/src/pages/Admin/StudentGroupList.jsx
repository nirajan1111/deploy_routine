import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import StudentGroupForm from './StudentGroupForm';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RoutineTable from '../../components/routine/RoutineTable';
import BACKEND_URL from './../../config';

const StudentGroupList = ({year}) => {
    const [studentGroups, setStudentGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    useEffect(() => {
        fetchStudentGroups();
    }, []);

    const fetchStudentGroups = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/student-sections?limit=100&offset=0`,{
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setStudentGroups(response.data || []);
        } catch (error) {
            toast.error('Failed to fetch student groups. Please try again.');
            console.error('Error fetching student groups:', error);
            setStudentGroups([]);
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
                await axios.delete(`${BACKEND_URL}/student-sections/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                toast.success('Student group deleted successfully');
                fetchStudentGroups();
            } catch (error) {
                toast.error('Failed to delete student group. Please try again.');
                console.error('Error deleting student group:', error);
            }
        }
    };

    const handleFormSubmit = async (groupData) => {
        try {
            if (currentGroup) {
                await axios.put(`${BACKEND_URL}/student-sections/${currentGroup.id}`, groupData, {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                toast.success('Student group updated successfully');
            } else {
                await axios.post(`${BACKEND_URL}/student-sections`, groupData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                toast.success('Student group added successfully');
            }
            setShowForm(false);
            setCurrentGroup(null);
            fetchStudentGroups();
        } catch (error) {
            toast.error('Failed to save student group. Please try again.');
            console.error('Error saving student group:', error);
        }
    };

    const handleViewStudents = (groupId) => {
        // You could implement a modal or navigate to a detailed view
        alert(`Viewing students for group ID: ${groupId}`);
    };

    const handleShowSchedules = (group) => {
        setSelectedGroup(group);
        setShowScheduleModal(true);
    };

    const filteredGroups = studentGroups.filter(group =>
        group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.program?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        overflow: 'auto',
        borderRadius: 2
    };

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
                                    className="pl-10 pr-4  bg-white py-2 border rounded-md w-full"
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
                                                        className="text-red-600 hover:text-red-800 mr-3"
                                                        onClick={() => handleDelete(group.id)}
                                                        title="Delete Group"
                                                    >
                                                        <FaTrash size={18} />
                                                    </button>
                                                    <button
                                                        className="text-purple-600 hover:text-purple-800"
                                                        onClick={() => handleShowSchedules(group)}
                                                        title="Show Schedules"
                                                    >
                                                        <FaCalendarAlt size={18} />
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

            <Modal
                open={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                aria-labelledby="group-schedules-modal"
            >
                <Box sx={modalStyle}>
                    <Typography id="schedule-modal-title" variant="h5" component="h2" className="mb-4">
                        Schedules for Group: {selectedGroup?.name}
                    </Typography>
                    {selectedGroup && (
                        <RoutineTable userGroup={selectedGroup.id} year={year}/>
                    )}
                    <div className="flex justify-end mt-4">
                        <button
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            onClick={() => setShowScheduleModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default StudentGroupList;