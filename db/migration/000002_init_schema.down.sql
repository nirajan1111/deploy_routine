ALTER TABLE schedules DROP CONSTRAINT IF EXISTS unique_room_timeslot;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS unique_teacher_timeslot;
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS unique_group_timeslot;