-- name: CreateStudentSection :one
INSERT INTO student_section (
  name,
  program,
  year_enrolled,
  group_name,
  department
) VALUES (
  $1, $2, $3, $4, $5
) RETURNING *;

-- name: GetStudentSection :one
SELECT * FROM student_section
WHERE id = $1 LIMIT 1;

-- name: ListStudentSections :many
SELECT * FROM student_section
ORDER BY id
LIMIT $1
OFFSET $2;

-- name: UpdateStudentSection :one
UPDATE student_section
SET name = $2,
    program = $3,
    year_enrolled = $4,
    group_name = $5,
    department = $6
WHERE id = $1
RETURNING *;

-- name: DeleteStudentSection :exec
DELETE FROM student_section
WHERE id = $1;

-- name: GetStudentSectionsByDepartment :many
SELECT * FROM student_section
WHERE department = $1
ORDER BY id;

-- name: GetStudentSectionsByProgram :many
SELECT * FROM student_section
WHERE program = $1
ORDER BY id;

-- name: GetStudentSectionsByYear :many
SELECT * FROM student_section
WHERE year_enrolled = $1
ORDER BY id;

-- name: CountStudentSections :one
SELECT count(*) FROM student_section;

-- name: GetStudentsInSection :many
SELECT s.* FROM student s
JOIN student_section ss ON s.group_id = ss.id
WHERE ss.id = $1
ORDER BY s.id;