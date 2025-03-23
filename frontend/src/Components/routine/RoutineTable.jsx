import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Modal,
  Button,
  Select,
  MenuItem,
} from '@mui/material';
import NepaliDate from 'nepali-date-converter';
import { styled } from '@mui/system';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import BACKEND_URL from './../../config';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: 14,
  padding: '16px',
  textAlign: 'center',
  cursor: 'pointer',
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: 16,
  textAlign: 'center',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const StyledTableRow = styled(TableRow)(({ theme, isOdd }) => ({
  backgroundColor: isOdd ? theme.palette.grey[200] : theme.palette.common.white,
}));

const RoutineTable = (props) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

 
  const today = new Date();

const nepaliDate = new NepaliDate(today);

  const [schedules, setSchedules] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editedSchedule, setEditedSchedule] = useState({
    group_id: null,
    room_id: null,
    subject_id: null,
    teacher_email: null,
    time_slot: null,
    year: nepaliDate.getYear()
  })
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];
  const timeSlots = [
    { start_time: '16:15', end_time: '17:55' },
    { start_time: '17:55', end_time: '19:35' },
  ];
  const token = localStorage.getItem('token');

  const authHeader = { 
    Authorization: `Bearer ${token}` 
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let scheduleResponse;
        if (props?.userGroup) {
          scheduleResponse = await axios.get(`${BACKEND_URL}/schedules/group/${props.userGroup}?year=${props.year}`,);
        if (scheduleResponse.status === 200) {
          setSchedules(scheduleResponse.data);
        }
        } else if (props?.roomNo) {
          scheduleResponse = await axios.get(`${BACKEND_URL}/schedules/room/${props.roomNo}?year=${props.year}`);
          setSchedules(scheduleResponse.data);
        } else if (props?.teacherEmail) {
          scheduleResponse = await axios.get(`${BACKEND_URL}/schedules/teacher/${props.teacherEmail}?year=${props.year}`, {
            headers: authHeader
          });
          setSchedules(scheduleResponse.data);
        }
        
        const subjectResponse = await axios.get(`${BACKEND_URL}/subjects?limit=50&offset=0`, {
          headers: authHeader
        });
        setSubjects(subjectResponse.data);

        // Get rooms
        const roomResponse = await axios.get(`${BACKEND_URL}/rooms?limit=100&offset=01`);
        setRooms(roomResponse.data);
        
      } catch (error) {
        setSchedules([]);
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch routine data');
      }
    };

    fetchData();
  }, [props.userGroup, props.roomNo, props.teacherEmail, token]);

  const handleChange = (field, value) => {
    setEditedSchedule((prev) => ({ ...prev, [field]: value }));
    if (field === 'subject_id') {
      updateTeachersForSubject(value);
    }
  };

  const updateTeachersForSubject = async (subjectId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/subject/${subjectId}/teachers`, {
        headers: authHeader
      });
      setTeachers(response.data || []);
    } catch (error) {
      console.error('Error fetching teachers for subject:', error);
      setTeachers([]);
    }
  };

  const getScheduleForSlot = (day, timeSlot) => {
    if(!schedules) return null;
    return schedules?.find(
      (schedule) =>
       schedule.time_slot === day + '-' + timeSlot.start_time + '-' + timeSlot.end_time
    );
  };

  const handleCellDoubleClick = (schedule, timeSlot, day, userGroup) => {
    if(user?.role === 'admin' && props?.userGroup){ 
      setSelectedSchedule(schedule);
      
      if (schedule) {
        setEditedSchedule({
          group_id: schedule.group_id || null,
          room_id: schedule.room_id || null,
          subject_id: schedule.subject_id || null,
          teacher_email: schedule.teacher_email || null,
          time_slot: schedule.time_slot || null,
          year: nepaliDate.getYear()
        });

        if (schedule.subject_id) {
          updateTeachersForSubject(schedule.subject_id);
        }
      } else {
        setEditedSchedule({
          group_id: userGroup || null,
          room_id: props.roomNo || null, 
          subject_id: null,
          teacher_email: props.teacherEmail || null,
          time_slot: day + '-' + timeSlot.start_time + '-' + timeSlot.end_time,
          year: nepaliDate.getYear()
        });
        setTeachers([]);
      }
      
      setOpenModal(true);
    }
  };

  const handleSave = async () => {
    try {
      if (selectedSchedule) {
        await axios.put(`${BACKEND_URL}/schedules/${selectedSchedule.id}`, editedSchedule, {
          headers: authHeader
        });
        toast.success('Schedule updated successfully!');
        
        setSchedules((prevSchedules) =>
          prevSchedules.map((sched) =>
            sched.id === selectedSchedule.id ? { ...sched, ...editedSchedule } : sched
          )
        );
      } else {
        await axios.post(`${BACKEND_URL}/schedules`, editedSchedule, {
          headers: authHeader
        });
        toast.success('Schedule created successfully!');
        
        let updatedSchedules;
        if (props?.userGroup) {
          updatedSchedules = await axios.get(`${BACKEND_URL}/schedules/group/${props.userGroup}`);
        } else if (props?.roomNo) {
          updatedSchedules = await axios.get(`${BACKEND_URL}/schedules/room/${props.roomNo}`);
        } else if (props?.teacherEmail) {
          updatedSchedules = await axios.get(`${BACKEND_URL}/schedules/teacher/${props.teacherEmail}`, {
            headers: authHeader
          });
        }
        
        if (updatedSchedules) {
          setSchedules(updatedSchedules.data);
        }
      }
      setOpenModal(false); 
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An error occurred while saving the schedule';
      toast.error(errorMessage);
    }
  };

  return (
    <Box m={4}>
      <Typography variant="h5" align="center" gutterBottom>
        Routine Schedule for {props?.title}
        {user?.role === 'admin' && props?.userGroup&&(
          <h6 style={{
            fontSize: '12px',
          }}>Double click box to edit or add</h6>
        )}
      
      </Typography>
      <TableContainer component={Paper} elevation={4}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>Time/Day</StyledTableHeadCell>
              {timeSlots.map((timeSlot, index) => (
                <StyledTableHeadCell key={index}>
                  {`${timeSlot.start_time} - ${timeSlot.end_time}`}
                </StyledTableHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {days.map((day, rowIndex) => (
              <StyledTableRow key={day} isOdd={rowIndex % 2 !== 0}>
                <StyledTableCell>{day}</StyledTableCell>
                {timeSlots.map((timeSlot, colIndex) => {

                  const schedule = getScheduleForSlot(day, timeSlot);
                  return (
                    <StyledTableCell
                      key={colIndex}
                      onDoubleClick={() => handleCellDoubleClick(schedule, timeSlot, day, props?.userGroup)}
                    >
                      {schedule ? (
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {schedule.subject_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                          {schedule.teacher_designation}  {schedule.teacher_name}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            Room: {schedule.room_code}
                          </Typography>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </StyledTableCell>
                  );
                })}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ p: 4, backgroundColor: 'white', width: 400, margin: 'auto', mt: 10, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            {selectedSchedule ? 'Edit Schedule' : 'Create New Schedule'}
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Subject</Typography>
          <Select 
            value={editedSchedule.subject_id} 
            fullWidth 
            onChange={(e) => handleChange('subject_id', e.target.value)}
          >
            <MenuItem value={null}>Select Subject</MenuItem>
            {subjects.map((subject) => (
              <MenuItem key={subject.id} value={subject.id}>
                {subject.name}
              </MenuItem>
            ))}
          </Select>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Teacher</Typography>
          <Select 
            value={editedSchedule.teacher_email} 
            fullWidth 
            onChange={(e) => handleChange('teacher_email', e.target.value)}
          >
            <MenuItem value={null}>Select Teacher</MenuItem>
            {teachers.map((teacher) => (
              <MenuItem key={teacher.teacher_email} value={teacher.teacher_email}>
                {teacher.teacher_name}
              </MenuItem>
            ))}
          </Select>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Room</Typography>
          <Select 
            value={editedSchedule.room_id} 
            fullWidth 
            onChange={(e) => handleChange('room_id', e.target.value)}
          >
            <MenuItem value={null}>Select Room</MenuItem>
            {rooms.map((room) => (
              <MenuItem key={room.id} value={room.id}>
                {room.room_code}
              </MenuItem>
            ))}
          </Select>
          
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleSave} 
            sx={{ mt: 3 }}
          >
            {selectedSchedule ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default RoutineTable;