import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch,FaCalendarAlt } from 'react-icons/fa';
import TeacherForm from './TeacherForm';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RoutineTable from '../../Components/routine/RoutineTable';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BACKEND_URL from './../../config';

const TeacherList = ({ year }) => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to continue');
                return;
            }

            const response = await axios.get(`${BACKEND_URL}/teachers?limit=100&offset=0`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            setTeachers(response.data || []);
        } catch (error) {
            toast.error('Failed to fetch teachers. Please try again.');
            console.error('Error fetching teachers:', error);
            setTeachers([

            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (teacher) => {
        setCurrentTeacher(teacher);
        setShowForm(true);
    };

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
    const handleDelete = async (email) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                await axios.delete(`${BACKEND_URL}/teachers/${email}`
                    , {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        }
                    }
                );
                setTeachers(teachers.filter(t => t.email !== email));
            } catch (error) {
                console.error('Error deleting teacher:', error);
                toast.error('Failed to delete teacher. Please try again.');
            }
        }
    };

    const handleFormSubmit = async (teacherData) => {
        try {
            if (currentTeacher) {
                await axios.put(`${BACKEND_URL}/teachers/${currentTeacher.email}`, teacherData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    }
                });
            } else {
                await axios.post(`${BACKEND_URL}/teachers`, teacherData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    }
                });
            }
            setShowForm(false);
            setCurrentTeacher(null);
            fetchTeachers();
        } catch (error) {
            console.error('Error saving teacher:', error);
            alert('Failed to save teacher. Please try again.');
        }
    };
    const handleShowSchedules = (teacher) => {
        setSelectedTeacher(teacher);
        setShowScheduleModal(true);
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
                                    className="pl-10 pr-4 bg-white  py-2 border rounded-md w-full"
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
                                                    <button
                                                        className="text-purple-600 hover:text-purple-800"
                                                        onClick={() => handleShowSchedules(teacher)}
                                                        title="Show Schedules"
                                                    >
                                                        <FaCalendarAlt size={18} />
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
            <Modal
                open={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                aria-labelledby="group-schedules-modal"
            >
                <Box sx={modalStyle}>
                    <Typography id="schedule-modal-title" variant="h5" component="h2" className="mb-4">
                        Schedules for Group: {selectedTeacher?.name}
                    </Typography>
                    {selectedTeacher && (
                        <RoutineTable teacherEmail={selectedTeacher.email} year={year} title={selectedTeacher.name} />
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

export default TeacherList;