import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import RoomForm from './RoomForm';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/rooms?limit=100&offset=0');
      setRooms(response.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // Use mock data for demonstration
      setRooms([
        { id: 1, room_code: 'A101', block_no: 'A', floor_no: 1, screen_available: true, department: 'Computer Science' },
        { id: 2, room_code: 'B203', block_no: 'B', floor_no: 2, screen_available: false, department: 'Mathematics' },
        { id: 3, room_code: 'C305', block_no: 'C', floor_no: 3, screen_available: true, department: 'Physics' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setCurrentRoom(room);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await axios.delete(`http://localhost:8080/rooms/${id}`);
        setRooms(rooms.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Failed to delete room. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (roomData) => {
    try {
      if (currentRoom) {
        await axios.put(`http://localhost:8080/rooms/${currentRoom.id}`, roomData);
      } else {
        await axios.post('http://localhost:8080/rooms', roomData);
      }
      setShowForm(false);
      setCurrentRoom(null);
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Failed to save room. Please try again.');
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.room_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.block_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {showForm ? (
        <RoomForm
          room={currentRoom}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setCurrentRoom(null);
          }}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-semibold mb-2 sm:mb-0">Room List</h2>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative w-full sm:w-64">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  className="pl-10 pr-4 py-2 border rounded-md w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center space-x-2"
                onClick={() => {
                  setCurrentRoom(null);
                  setShowForm(true);
                }}
              >
                <FaPlus />
                <span>Add Room</span>
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
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Code</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screen</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                      <tr key={room.id}>
                        <td className="py-4 px-4 text-sm">{room.room_code}</td>
                        <td className="py-4 px-4 text-sm">{room.block_no}</td>
                        <td className="py-4 px-4 text-sm">{room.floor_no}</td>
                        <td className="py-4 px-4 text-sm">{room.department}</td>
                        <td className="py-4 px-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${room.screen_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {room.screen_available ? 'Available' : 'Not Available'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-right">
                          <button
                            className="text-blue-600 hover:text-blue-800 mr-3"
                            onClick={() => handleEdit(room)}
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDelete(room.id)}
                          >
                            <FaTrash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                        No rooms found
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

export default RoomList;