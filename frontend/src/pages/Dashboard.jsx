import React, { useState } from 'react';
import { FaUsers, FaUserGraduate, FaDoorOpen, FaCalendarAlt, FaChalkboardTeacher, FaBook } from 'react-icons/fa';
import { BiMenu } from 'react-icons/bi';
import TeacherList from './Admin/TeacherList';
import StudentGroupList from './Admin/StudentGroupList';
import RoomList from './Admin/RoomList';
import SubjectList from './Admin/SubjectList';
import ScheduleList from './Admin/ScheduleList';
import axios from 'axios';
import BACKEND_URL from './../config';
const Dashboard = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
                window.location.href = '/login';
        }

        if (user.role !== 'admin') {
                window.location.href = '/';
        }
        const [activeTab, setActiveTab] = useState('dashboard');
        const [sidebarOpen, setSidebarOpen] = useState(true);
        const [availableYears, setAvailableYears] = useState([]);
        const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
        const [isLoadingYears, setIsLoadingYears] = useState(false);

        React.useEffect(() => {
                const fetchYears = async () => {
                        setIsLoadingYears(true);
                        try {
                                const response = await axios.get(`${BACKEND_URL}/years/schedules`, {
                                        headers: {
                                                Authorization: `Bearer ${localStorage.getItem('token')}`
                                        }
                                });

                                if (response.data && response.data.years && response.data.years.length > 0) {
                                        setAvailableYears(response.data.years);
                                        // Set the current year as default if available
                                        const currentYear = new Date().getFullYear();
                                        if (response.data.years.includes(currentYear)) {
                                                setSelectedYear(currentYear);
                                        } else {
                                                // Otherwise use the most recent year
                                                setSelectedYear(Math.max(...response.data.years));
                                        }
                                }
                        } catch (error) {
                                console.error('Error fetching years:', error);
                        } finally {
                                setIsLoadingYears(false);
                        }
                };
                fetchYears();
        }, []);
        const handleYearChange = (e) => {
                setSelectedYear(parseInt(e.target.value, 10));
        };

        const renderContent = () => {
                switch (activeTab) {
                        case 'teachers':
                                return <TeacherList year={selectedYear} />;
                        case 'rooms':
                                return <RoomList year={selectedYear} />;
                        case 'subjects':
                                return <SubjectList year={selectedYear} />;
                        case 'schedules':
                                return <ScheduleList year={selectedYear} />;
                        default:
                                return <StudentGroupList year={selectedYear} />;
                }
        };

        return (
                <div className="flex h-screen bg-gray-100">
                        {/* Mobile sidebar toggle */}
                        <div className="lg:hidden fixed top-0 left-0 z-20 p-4">
                                <button
                                        onClick={() => setSidebarOpen(!sidebarOpen)}
                                        className="p-2 rounded-md bg-indigo-600 text-white focus:outline-none"
                                >
                                        <BiMenu size={24} />
                                </button>
                        </div>

                        {/* Sidebar */}
                        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                                } fixed lg:relative lg:translate-x-0 z-10 w-64 h-full bg-indigo-800 shadow-lg transform transition-transform duration-300 ease-in-out`}>
                                <div className="flex flex-col h-full">
                                        <div className="p-5">
                                                <h1 className="text-white font-bold text-2xl">Routiney Admin</h1>
                                        </div>
                                        <nav className="flex-grow">
                                                <ul className="space-y-1 px-3">
                                                        <SidebarItem
                                                                icon={<FaChalkboardTeacher />}
                                                                label="Student Groups"
                                                                active={activeTab === 'dashboard'}
                                                                onClick={() => setActiveTab('dashboard')}
                                                        />
                                                        <SidebarItem
                                                                icon={<FaUsers />}
                                                                label="Teachers"
                                                                active={activeTab === 'teachers'}
                                                                onClick={() => setActiveTab('teachers')}
                                                        />

                                                        <SidebarItem
                                                                icon={<FaDoorOpen />}
                                                                label="Rooms"
                                                                active={activeTab === 'rooms'}
                                                                onClick={() => setActiveTab('rooms')}
                                                        />
                                                        <SidebarItem
                                                                icon={<FaBook />}
                                                                label="Subjects"
                                                                active={activeTab === 'subjects'}
                                                                onClick={() => setActiveTab('subjects')}
                                                        />
                                                       
                                                </ul>
                                        </nav>
                                        <div className="p-5">
                                                <div className="flex items-center space-x-3 text-white">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                                                A
                                                        </div>
                                                        <div>
                                                                <p className="text-sm font-medium">Admin User</p>
                                                                <p className="text-xs opacity-70">admin@routiney.com</p>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>

                        {/* Main content */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                                <header className="bg-white shadow-sm z-10">
                                        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                                                <h1 className="text-2xl font-semibold text-gray-900">
                                                        {activeTab === 'dashboard' && 'Dashboard'}
                                                        {activeTab === 'teachers' && 'Teachers Management'}
                                                        {activeTab === 'student-groups' && 'Student Groups Management'}
                                                        {activeTab === 'rooms' && 'Rooms Management'}
                                                        {activeTab === 'subjects' && 'Subjects Management'}
                                                        {activeTab === 'schedules' && 'Schedules Management'}
                                                </h1>

                                                <div className="flex items-center">
                                                        <label htmlFor="year-select" className="mr-2 text-sm font-medium text-gray-700">
                                                                Academic Year:
                                                        </label>
                                                        <div className="relative">
                                                                <select
                                                                        id="year-select"
                                                                        value={selectedYear}
                                                                        onChange={handleYearChange}
                                                                        disabled={isLoadingYears || availableYears.length === 0}
                                                                        className="block bg-white  w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                                >
                                                                        {isLoadingYears ? (
                                                                                <option value="">Loading...</option>
                                                                        ) : (
                                                                                availableYears.map(year => (
                                                                                        <option key={year} value={year}>
                                                                                                {year}
                                                                                        </option>
                                                                                ))
                                                                        )}
                                                                </select>
                                                        </div>
                                                </div>
                                        </div>
                                </header>
                                <main className="flex-1 overflow-y-auto p-4">
                                        <div className="max-w-7xl mx-auto">
                                                {renderContent()}
                                        </div>
                                </main>
                        </div>
                </div>
        );
}

const SidebarItem = ({ icon, label, active, onClick }) => {
        return (
                <li>
                        <button
                                className={`w-full flex items-center p-3 rounded-lg text-sm font-medium ${active
                                        ? 'bg-indigo-900 text-white'
                                        : 'text-indigo-100 hover:bg-indigo-700'
                                        }`}
                                onClick={onClick}
                        >
                                <span className="mr-3">{icon}</span>
                                <span>{label}</span>
                        </button>
                </li>
        );
};

export default Dashboard;