import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUserFriends } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SubjectForm from './SubjectForm';
import TeacherAssignModal from './TeacherAssignModal';
import BACKEND_URL from './../../config';

const SubjectList = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentSubject, setCurrentSubject] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [subjectForAssignment, setSubjectForAssignment] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [assignedTeachers, setAssignedTeachers] = useState([]);

    useEffect(() => {
        fetchSubjects();
        fetchTeachers();
    }, []);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/subjects?limit=100&offset=0`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,

                },
            });
            setSubjects(response.data || []);
        } catch (error) {
            toast.error('Failed to fetch subjects. Please try again.');
            console.error('Error fetching subjects:', error);
            setSubjects([

            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/teachers?limit=20`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,

                },
            });
            setTeachers(response.data || []);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            setTeachers([]);
        }
    };

    const fetchAssignedTeachers = async (subjectId) => {
        try {
            const response = await axios.get(`${BACKEND_URL}/subject/${subjectId}/teachers`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,

                },
            });

            setAssignedTeachers(response.data || []);
        } catch (error) {
            console.error('Error fetching assigned teachers:', error);
            setAssignedTeachers([]);
        }
    };

    const handleEdit = (subject) => {
        setCurrentSubject(subject);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await axios.delete(`${BACKEND_URL}/subjects/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                toast.success('Subject deleted successfully');
                fetchSubjects();
            } catch (error) {
                toast.error('Failed to delete subject. Please try again.');
                console.error('Error deleting subject:', error);
            }
        }
    };

    const handleFormSubmit = async (subjectData) => {
        try {
            if (currentSubject) {
                await axios.put(`${BACKEND_URL}/subjects/${currentSubject.id}`, subjectData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,

                    },
                });
                toast.success('Subject updated successfully');
            } else {
                await axios.post(`${BACKEND_URL}/subjects`, subjectData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,

                    },
                });
                toast.success('Subject added successfully');
            }
            setShowForm(false);
            setCurrentSubject(null);
            fetchSubjects();
        } catch (error) {
            toast.error('Failed to save subject. Please try again.');
            console.error('Error saving subject:', error);
        }
    };

    const handleAssignTeachers = (subject) => {
        setSubjectForAssignment(subject);
        fetchAssignedTeachers(subject.id);
        setShowAssignModal(true);
    };

    const handleAssignTeacher = async (teacherEmail) => {
        try {
            await axios.post(`${BACKEND_URL}/subject/${subjectForAssignment.id}/${teacherEmail}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            toast.success('Teacher assigned to subject successfully');
            fetchAssignedTeachers(subjectForAssignment.id);
        } catch (error) {
            toast.error('Failed to assign teacher to subject. Please try again.');
            console.error('Error assigning teacher:', error);
        }
    };

    const handleRemoveTeacher = async (teacherEmail) => {
        try {
            await axios.get(`${BACKEND_URL}/subject/remove/${subjectForAssignment.id}/${teacherEmail}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            toast.success('Teacher removed from subject successfully');
            fetchAssignedTeachers(subjectForAssignment.id);
        } catch (error) {
            toast.error('Failed to remove teacher from subject. Please try again.');
            console.error('Error removing teacher:', error);
        }
    };

    const filteredSubjects = subjects.filter(subject =>
        subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.subject_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            {showForm ? (
                <SubjectForm
                    subject={currentSubject}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setCurrentSubject(null);
                    }}
                />
            ) : showAssignModal && subjectForAssignment ? (
                <TeacherAssignModal
                    subject={subjectForAssignment}
                    teachers={teachers}
                    assignedTeachers={assignedTeachers}
                    onAssign={handleAssignTeacher}
                    onRemove={handleRemoveTeacher}
                    onClose={() => {
                        setShowAssignModal(false);
                        setSubjectForAssignment(null);
                    }}
                />
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold mb-2 sm:mb-0">Subject List</h2>
                        <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
                            <div className="relative w-full sm:w-64">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search subjects..."
                                    className="pl-10 pr-4 py-2 border bg-white  rounded-md w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center space-x-2"
                                onClick={() => {
                                    setCurrentSubject(null);
                                    setShowForm(true);
                                }}
                            >
                                <FaPlus />
                                <span>Add Subject</span>
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
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredSubjects.length > 0 ? (
                                        filteredSubjects.map((subject) => (
                                            <tr key={subject.id}>
                                                <td className="py-4 px-4 text-sm">{subject.subject_code}</td>
                                                <td className="py-4 px-4 text-sm">{subject.name}</td>
                                                <td className="py-4 px-4 text-sm">{subject.department}</td>
                                                <td className="py-4 px-4 text-sm text-right">
                                                    <button
                                                        className="text-green-600 hover:text-green-800 mr-3"
                                                        onClick={() => handleAssignTeachers(subject)}
                                                        title="Assign Teachers"
                                                    >
                                                        <FaUserFriends size={18} />
                                                    </button>
                                                    <button
                                                        className="text-blue-600 hover:text-blue-800 mr-3"
                                                        onClick={() => handleEdit(subject)}
                                                        title="Edit Subject"
                                                    >
                                                        <FaEdit size={18} />
                                                    </button>
                                                    <button
                                                        className="text-red-600 hover:text-red-800"
                                                        onClick={() => handleDelete(subject.id)}
                                                        title="Delete Subject"
                                                    >
                                                        <FaTrash size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                                                No subjects found
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

export default SubjectList;