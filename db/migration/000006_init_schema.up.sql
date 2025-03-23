ALTER TABLE schedules 
ADD COLUMN year INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE) CHECK (year >= 2000);

ALTER TABLE schedules DROP CONSTRAINT unique_room_timeslot;
ALTER TABLE schedules DROP CONSTRAINT unique_teacher_timeslot;
ALTER TABLE schedules DROP CONSTRAINT unique_group_timeslot;

ALTER TABLE schedules ADD CONSTRAINT unique_room_timeslot UNIQUE (room_id, time_slot, year);
ALTER TABLE schedules ADD CONSTRAINT unique_teacher_timeslot UNIQUE (teacher_email, time_slot, year);
ALTER TABLE schedules ADD CONSTRAINT unique_group_timeslot UNIQUE (group_id, time_slot, year);
