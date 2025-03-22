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
import { styled } from '@mui/system';
import api from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [schedules, setSchedules] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editedSchedule, setEditedSchedule] = useState({
    subject: null,
    teacher: null,
    room: null,
    timeSlot: null,
    userGroup: null,
    day: null
  });
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];
  const timeSlots = [
    { start_time: '16:15:00', end_time: '17:55:00' },
    { start_time: '17:55:00', end_time: '19:35:00' },
  ];
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch schedules
        if (props?.userGroup) {
          const scheduleResponse = await api.get(`schedules/?group=${props.userGroup}`);
          setSchedules(scheduleResponse.data);
        } else if (props?.roomNo) {
          const scheduleResponse = await api.get(`schedules/?roomNo=${props.roomNo}`);
          setSchedules(scheduleResponse.data);
        } else if (props?.teacherEmail) {
          const scheduleResponse = await api.get(`schedules/?email=${props.teacherEmail}`);
          setSchedules(scheduleResponse.data);
        }
        // Fetch subjects
        const subjectResponse = await api.get("subjects");
        setSubjects(subjectResponse.data);

        // Fetch rooms
        const roomResponse = await api.get('room');
        setRooms(roomResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch routine data');
      }
    };

    fetchData();
  }, [props.userGroup, props.roomNo, props.teacherEmail]);


  const handleChange = (field, value) => {
    setEditedSchedule((prev) => ({ ...prev, [field]: value }));
    if (field === 'subject') {
      updateTeachersForSubject(value);
    }
  };

  const updateTeachersForSubject = (subjectId) => {
    console.log(subjectId)
    const selectedSubject = subjects.find(subject => subject.id === subjectId);
    console.log("Here are the selected subjects", selectedSubject)
    if (selectedSubject && selectedSubject.teachers_details) {
      setTeachers(selectedSubject.teachers_details);
    } else {
      setTeachers([]);
    }
  };

  const getScheduleForSlot = (day, timeSlot) => {
    return schedules.find(
      (schedule) =>
        schedule.time_slot_detail.day === day &&
        schedule.time_slot_detail.start_time === timeSlot.start_time &&
        schedule.time_slot_detail.end_time === timeSlot.end_time
    );
  };

  const handleCellDoubleClick = (schedule, timeSlot, day, userGroup) => {
    if (user.is_superuser) {
      setSelectedSchedule(schedule);
      if (schedule) {
        setEditedSchedule({
          subject: schedule.subject_detail?.id || null,
          teacher: schedule.teacher_detail?.id || null,
          room: schedule.room_detail?.id || null,
        });

        if (schedule.subject_detail?.id) {
          updateTeachersForSubject(schedule.subject_detail.id);
        }
      } else {
        setEditedSchedule({ subject: null, teacher: null, room: null, day: day, timeSlot: timeSlot, group: userGroup });

        setTeachers([]);
      }
      setOpenModal(true);
    }
  };



  const handleSave = async () => {
    try {
      if (selectedSchedule) {
        const response = await api.put(`schedules/${selectedSchedule.id}/`, editedSchedule);
        toast.success('Schedule updated successfully!');
        setSchedules((prevSchedules) =>
          prevSchedules.map((sched) =>
            sched.id === selectedSchedule.id ? { ...sched, ...editedSchedule } : sched
          )
        );
      } else {
        const response = await api.post(`schedules/create/`, editedSchedule);
        toast.success('Schedule created successfully!');
        if (props?.userGroup) {
          const scheduleResponse = await api.get(`schedules/?group=${props.userGroup}`);
          setSchedules(scheduleResponse.data);
        } else if (props?.roomNo) {
          const scheduleResponse = await api.get(`schedules/?roomNo=${props.roomNo}`);
          setSchedules(scheduleResponse.data);
        }
      }
      setOpenModal(false); // Close the modal after successful operation
    } catch (error) {
      // Display the error message from the backend
      const errorMessage = error.response?.data?.error || 'An error occurred while saving the schedule';
      toast.error(errorMessage);
    }
  };

  return (
    <Box m={4}>
      <Typography variant="h5" align="center" gutterBottom>
        Routine Schedule
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
                  console.log(schedule)
                  return (
                    <StyledTableCell
                      key={colIndex}
                      onDoubleClick={() => handleCellDoubleClick(schedule, timeSlot, day, props?.userGroup)}
                    >
                      {schedule ? (
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {schedule.subject_detail.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {schedule.teacher_detail.designation} Professor {schedule.teacher_detail.name}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            Room.no{" "}{schedule.room_detail.room_code}
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
          <Typography variant="h6" gutterBottom>Edit Schedule</Typography>
          <Select value={editedSchedule.subject} fullWidth onChange={(e) => handleChange('subject', e.target.value)}>
            {subjects.map((subject) => (
              <MenuItem key={subject.id} value={subject.id}>
                {subject.name}
              </MenuItem>
            ))}
          </Select>
          <Select value={editedSchedule.teacher} fullWidth onChange={(e) => handleChange('teacher', e.target.value)}>
            {teachers.length > 0 && (teachers.map((teacher) => (
              <MenuItem key={teacher.email} value={teacher.email}>
                {teacher.name}
              </MenuItem>
            )))}
          </Select>
          <Select value={editedSchedule.room} fullWidth onChange={(e) => handleChange('room', e.target.value)}>
            {rooms.length > 0 && (
              rooms.map((room) =>

                <MenuItem key={room.id} value={room.id}>
                  {room.room_code}
                </MenuItem>
              ))
            }
          </Select>
          <Button variant="contained" color="primary" fullWidth onClick={handleSave} sx={{ mt: 2 }}>
            Save Changes
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default RoutineTable;
