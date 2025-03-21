-- name: CreateTeacher :one
INSERT INTO teacher (name, email, department, designation)
VALUES ($1, $2, $3, $4)
RETURNING *;


-- name: GetTeacherByEmail :one
SELECT * FROM teacher WHERE email = $1;

-- name: UpdateTeacherByEmail :exec
UPDATE teacher
SET name = $2, department = $3, designation = $4
WHERE email = $1
RETURNING *;

-- name: DeleteTeacherByEmail :exec
DELETE FROM teacher WHERE email = $1
RETURNING *;

-- name: GetTeachers :many
SELECT * FROM teacher LIMIT $1 OFFSET $2;