import React, { useEffect, useState } from 'react';
import { Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchedules } from '../store/routineSlice';
import Layout from '../components/Layout';
import RoutineTable from '../components/routine/RoutineTable';
import NaturalLanguageQuery from '../components/routine/NaturalLanguageQuery';
import RoutineOptimizer from '../components/routine/RoutineOptimizer';
import api from '../services/api';
import { RoutineList } from '../components/routine';
import axios from 'axios';
import BACKEND_URL from './../config';
const RoutinePage = () => {
  const dispatch = useDispatch();
  const { schedules, loading } = useSelector((state) => state.routine);
  const userString = localStorage.getItem('user');
  const user = null

  const [roomNo, setRoom] = useState(0);
  const [groups, setGroup] = useState([])
  const [selectedgroupIs, setSelectedGroup] = useState(0);
  const [showgroup, setshowgroup] = useState(false);
  const userGroup = user?.group;

  const id = user?.is_teacher ? user?.email : "";


 
  const fetchGroup = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/student-sections?limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        setGroup(response.data)
      }
    } catch (err) {
      console.log('Error fetching groups', err)
    }
  }

  useEffect(() => {
    dispatch(fetchSchedules());
    fetchGroup()
  }, [dispatch]);

  return (
    <Layout>
   
    {/*
      <FormControl fullWidth margin="normal">
        <InputLabel id="group-select-label"></InputLabel>
        <Select
          labelId="group-select-label"
          value={selectedgroupIs}
          onChange={(e) => {

            setSelectedGroup(e.target.value)
            setRoom(0);
            setshowgroup(true)
          }}
          displayEmpty
        >
          <MenuItem value={0} disabled>
            -- Select Group --
          </MenuItem>
          {groups.map((group) => (
            <MenuItem key={group.id} value={group.id} >
              {group.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      */}
      {
        selectedgroupIs===0&&(
          <RoutineList groups={groups}/>
        )
      }
     
      {loading || selectedgroupIs===0 ? (
     <></>
      ) : (
        
        <RoutineTable userGroup={selectedgroupIs > 0 ? selectedgroupIs : userGroup} id={id} roomNo={roomNo} showgroup={showgroup} />
      )}
    </Layout>
  );
};

export default RoutinePage;
