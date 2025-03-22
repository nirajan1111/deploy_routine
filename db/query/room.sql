-- name: CreateRoom :one
INSERT INTO room (
    room_code,
    block_no,
    floor_no,
    screen_available,
  department
) VALUES (
    $1,
    $2,
    $3,
    $4,
   $5
) RETURNING *;

-- name: GetRoom :one
SELECT * FROM room
WHERE id = $1 LIMIT 1;

-- name: ListRooms :many
SELECT * FROM room
ORDER BY id
LIMIT $1
OFFSET $2;

-- name: UpdateRoom :one
UPDATE room
SET department = $2
  , room_code = $3
  , block_no = $4
  , floor_no = $5
  , screen_available = $6
WHERE id = $1
RETURNING *;

-- name: DeleteRoom :exec
DELETE FROM room
WHERE id = $1;

-- name: GetRoomsByDepartment :many
SELECT * FROM room
WHERE department = $1
ORDER BY id;

-- name: CountRooms :one
SELECT count(*) FROM room;