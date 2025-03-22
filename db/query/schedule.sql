-- name: CreateSchedule :one
INSERT INTO schedules (
  group_id,
  room_id,
  subject_id,
  teacher_email,
  time_slot
) VALUES (
  $1, $2, $3, $4, $5
) RETURNING *;

-- name: GetSchedule :one
SELECT * FROM schedules
WHERE id = $1 LIMIT 1;

-- name: ListSchedules :many
SELECT * FROM schedules
ORDER BY time_slot
LIMIT $1
OFFSET $2;

-- name: UpdateSchedule :one
UPDATE schedules
SET 
  group_id = $2,
  room_id = $3,
  subject_id = $4,
  teacher_email = $5,
  time_slot = $6
WHERE id = $1
RETURNING *;

-- name: DeleteSchedule :exec
DELETE FROM schedules
WHERE id = $1;

-- name: GetSchedulesByTeacher :many
SELECT s.*, 
  t.name AS teacher_name,
  r.room_code,
  r.block_no,
  sub.subject_code,
  sub.name AS subject_name,
  ss.name AS group_name
FROM schedules s
JOIN teacher t ON s.teacher_email = t.email
JOIN room r ON s.room_id = r.id
JOIN subject sub ON s.subject_id = sub.id
JOIN student_section ss ON s.group_id = ss.id
WHERE s.teacher_email = $1
ORDER BY s.time_slot;

-- name: GetSchedulesByRoom :many
SELECT s.*, 
  t.name AS teacher_name,
  r.room_code,
  r.block_no,
  sub.subject_code,
  sub.name AS subject_name,
  ss.name AS group_name
FROM schedules s
JOIN teacher t ON s.teacher_email = t.email
JOIN room r ON s.room_id = r.id
JOIN subject sub ON s.subject_id = sub.id
JOIN student_section ss ON s.group_id = ss.id
WHERE s.room_id = $1
ORDER BY s.time_slot;

-- name: GetSchedulesByGroup :many
SELECT s.*, 
  t.name AS teacher_name,
  r.room_code,
  r.block_no,
  sub.subject_code,
  sub.name AS subject_name,
  ss.name AS group_name
FROM schedules s
JOIN teacher t ON s.teacher_email = t.email
JOIN room r ON s.room_id = r.id
JOIN subject sub ON s.subject_id = sub.id
JOIN student_section ss ON s.group_id = ss.id
WHERE s.group_id = $1
ORDER BY s.time_slot;

-- name: CountSchedules :one
SELECT count(*) FROM schedules;

-- name: CheckScheduleConflicts :one
SELECT EXISTS (
  SELECT 1 FROM schedules
  WHERE time_slot = $1 AND (
    room_id = $2 OR 
    teacher_email = $3 OR 
    group_id = $4
  )
) AS conflict_exists;