import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaCalendarAlt } from 'react-icons/fa';
import RoomForm from './RoomForm';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RoutineTable from '../../components/routine/RoutineTable';
import BACKEND_URL from './../../config';

const RoomList = ({year}) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/rooms?limit=100&offset=0`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setRooms(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch rooms. Please try again.');
      console.error('Error fetching rooms:', error);
      setRooms([]);
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
        await axios.delete(`${BACKEND_URL}/rooms/${id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        toast.success('Room deleted successfully');
        fetchRooms();
      } catch (error) {
        toast.error('Failed to delete room. Please try again.');
        console.error('Error deleting room:', error);
      }
    }
  };

  const handleFormSubmit = async (roomData) => {
    try {
      if (currentRoom) {
        await axios.put(`${BACKEND_URL}/rooms/${currentRoom.id}`, roomData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        toast.success('Room updated successfully');
      } else {
        await axios.post('${BACKEND_URL}/rooms', roomData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        toast.success('Room added successfully');
      }
      setShowForm(false);
      setCurrentRoom(null);
      fetchRooms();
    } catch (error) {
      toast.error('Failed to save room. Please try again.');
      console.error('Error saving room:', error);
    }
  };

  const handleShowSchedules = (room) => {
    setSelectedRoom(room);
    setShowScheduleModal(true);
  };

  const filteredRooms = rooms.filter(room =>
    room.room_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.block_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.department?.toLowerCase().includes(searchTerm.toLowerCase())
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
                  className="pl-10 pr-4 bg-white  py-2 border rounded-md w-full"
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
                            title="Edit Room"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 mr-3"
                            onClick={() => handleDelete(room.id)}
                            title="Delete Room"
                          >
                            <FaTrash size={18} />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-800"
                            onClick={() => handleShowSchedules(room)}
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

      <Modal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        aria-labelledby="room-schedules-modal"
      >
        <Box sx={modalStyle}>
          <Typography id="schedule-modal-title" variant="h5" component="h2" className="mb-4">
            Schedules for Room: {selectedRoom?.room_code}
          </Typography>
          {selectedRoom && (
            <RoutineTable roomNo={selectedRoom.id} year={year}/>
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

export default RoomList;