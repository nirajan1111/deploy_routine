import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaUserGraduate, FaDoorOpen, FaCalendarAlt } from 'react-icons/fa';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    teachers: 0,
    studentGroups: 0,
    rooms: 0,
    schedules: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading statistics
    const fetchStats = async () => {
      try {
        // In a real app, you would fetch these from your API
        // const teachersResponse = await axios.get('http://localhost:8080/teachers/count');
        // For now, we'll use mock data
        setTimeout(() => {
          setStats({
            teachers: 24,
            studentGroups: 12,
            rooms: 18,
            schedules: 36
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 ${color}`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color.replace('border-l-4', 'bg-opacity-10 text-opacity-100')}`}>
          {icon}
        </div>
        <div className="ml-5">
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-semibold">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              value
            )}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          icon={<FaUsers size={24} className="text-blue-600" />} 
          title="Total Teachers" 
          value={stats.teachers}
          color="border-l-4 border-blue-600"
        />
        <StatCard 
          icon={<FaUserGraduate size={24} className="text-green-600" />} 
          title="Student Groups" 
          value={stats.studentGroups}
          color="border-l-4 border-green-600"
        />
        <StatCard 
          icon={<FaDoorOpen size={24} className="text-yellow-600" />} 
          title="Available Rooms" 
          value={stats.rooms}
          color="border-l-4 border-yellow-600"
        />
        <StatCard 
          icon={<FaCalendarAlt size={24} className="text-purple-600" />} 
          title="Total Schedules" 
          value={stats.schedules}
          color="border-l-4 border-purple-600"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            <ActivityItem 
              action="Updated room" 
              target="Room 101"
              time="2 hours ago"
              user="admin@routiney.com"
            />
            <ActivityItem 
              action="Added teacher" 
              target="John Smith"
              time="5 hours ago"
              user="admin@routiney.com"
            />
            <ActivityItem 
              action="Modified schedule" 
              target="CS-101 Class"
              time="Yesterday"
              user="admin@routiney.com"
            />
            <ActivityItem 
              action="Created student group" 
              target="Computer Science Year 2"
              time="2 days ago"
              user="admin@routiney.com"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionCard 
              title="Add Teacher"
              description="Register a new teacher in the system"
              icon={<FaUsers className="text-blue-600" />}
              color="border-blue-600"
            />
            <QuickActionCard 
              title="Create Group"
              description="Add a new student group"
              icon={<FaUserGraduate className="text-green-600" />}
              color="border-green-600"
            />
            <QuickActionCard 
              title="Add Room"
              description="Register a new classroom"
              icon={<FaDoorOpen className="text-yellow-600" />}
              color="border-yellow-600"
            />
            <QuickActionCard 
              title="Schedule Class"
              description="Create a new class schedule"
              icon={<FaCalendarAlt className="text-purple-600" />}
              color="border-purple-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ action, target, time, user }) => (
  <div className="flex items-start">
    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
      <span className="text-xs font-medium">{user.charAt(0).toUpperCase()}</span>
    </div>
    <div className="ml-3">
      <p className="text-sm">
        <span className="font-medium">{action}</span>
        {' '}
        <span className="text-gray-700">{target}</span>
      </p>
      <p className="text-xs text-gray-500">{time} by {user}</p>
    </div>
  </div>
);

const QuickActionCard = ({ title, description, icon, color }) => (
  <div className={`border-l-4 ${color} bg-white p-4 rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
    <div className="flex items-center">
      <div className="mr-4">
        {icon}
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  </div>
);

export default DashboardHome;