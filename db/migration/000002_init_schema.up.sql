ALTER TABLE schedules ADD CONSTRAINT unique_room_timeslot UNIQUE (room_id, time_slot);
ALTER TABLE schedules ADD CONSTRAINT unique_teacher_timeslot UNIQUE (teacher_email, time_slot);
ALTER TABLE schedules ADD CONSTRAINT unique_group_timeslot UNIQUE (group_id, time_slot);