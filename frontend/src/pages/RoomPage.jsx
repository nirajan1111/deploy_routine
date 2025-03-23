import React, { useEffect, useState } from 'react';
import { Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchedules } from '../store/routineSlice';
import Layout from '../components/Layout';
import RoutineTable from '../components/routine/RoutineTable';
import api from '../services/api';
import { RoutineList } from '../components/routine';
import axios from 'axios';
import BACKEND_URL from './../config';
const RoomPage = () => {
  const dispatch = useDispatch();
  const userString = localStorage.getItem('user');
  // const user = userString ? JSON.parse(userString) : null; 
  const user = null


  const [selectedRoomis, setSelectedRoom] = useState(0);
  const [showgroup, setshowgroup] = useState(false);
  const [rooms , setRooms]=useState([])
  const userGroup = user?.group;

  const id = user?.is_teacher ? user?.email : "";


 
  
  const fetchRoom =async ()=>{
    try {
        const response =await axios.get(`${BACKEND_URL}/rooms?limit=10`,{
            headers:{
              "Content-Type":"application/json",
            }
          }
        ) 
        if(response.status===200){
            setRooms(response.data)
        }
    } catch (error) {
        console.log(error)
    }
  }

  useEffect(() => {
    fetchRoom()
    dispatch(fetchSchedules());
  }, [dispatch]);

  return (
    <Layout>
      {/*
      <FormControl fullWidth margin="normal">
        <InputLabel id="group-select-label"></InputLabel>
        <Select
          labelId="group-select-label"
          value={selectedRoomis}
          onChange={(e) => {

            setSelectedRoom(e.target.value)
            
            setshowgroup(true)
          }}
          displayEmpty
        >
          <MenuItem value={0} disabled>
            -- Select Room --
          </MenuItem>
          {rooms.map((room) => (
            <MenuItem key={room.id} value={room.id} >
              {room?.room_code}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      */}
      {
        selectedRoomis===0&&(
          <RoutineList groups={rooms.map(room=>({
            ...room,
            name :room.room_code,
         
          }))}/>
        )
      }
     
      {selectedRoomis===0 ? (
     <></>
      ) : (
        
        <RoutineTable roomNo={selectedRoomis}/>
      )}
    </Layout>
  );
};

export default RoomPage;
