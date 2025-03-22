-- name: CreateSubject :one
INSERT INTO subject (
  id,
  subject_code,
  name,
  department
) VALUES (
  $1, $2, $3, $4
) RETURNING *;

-- name: GetSubject :one
SELECT * FROM subject
WHERE id = $1 LIMIT 1;

-- name: GetSubjectByCode :one
SELECT * FROM subject
WHERE subject_code = $1 LIMIT 1;

-- name: ListSubjects :many
SELECT * FROM subject
ORDER BY id
LIMIT $1
OFFSET $2;

-- name: UpdateSubject :one
UPDATE subject
SET subject_code = $2,
    name = $3,
    department = $4
WHERE id = $1
RETURNING *;

-- name: DeleteSubject :exec
DELETE FROM subject
WHERE id = $1;

-- name: GetSubjectsByDepartment :many
SELECT * FROM subject
WHERE department = $1
ORDER BY id;

-- name: CountSubjects :one
SELECT count(*) FROM subject;

-- name: GetSubjectTeachers :many
SELECT t.* FROM teacher t
JOIN subject_teachers st ON t.email = st.teacher_email
WHERE st.subject_id = $1;

-- name: AssignTeacherToSubject :exec
INSERT INTO subject_teachers (
  subject_id,
  teacher_email
) VALUES (
  $1, $2
);

-- name: RemoveTeacherFromSubject :exec
DELETE FROM subject_teachers
WHERE subject_id = $1 AND teacher_email = $2;