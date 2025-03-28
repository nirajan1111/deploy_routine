// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: teacher.sql

package db

import (
	"context"
	"database/sql"
)

const createTeacher = `-- name: CreateTeacher :one
INSERT INTO teacher (name, email, department, designation)
VALUES ($1, $2, $3, $4)
RETURNING name, email, department, designation
`

type CreateTeacherParams struct {
	Name        sql.NullString `json:"name"`
	Email       string         `json:"email"`
	Department  sql.NullString `json:"department"`
	Designation sql.NullString `json:"designation"`
}

func (q *Queries) CreateTeacher(ctx context.Context, arg CreateTeacherParams) (Teacher, error) {
	row := q.db.QueryRowContext(ctx, createTeacher,
		arg.Name,
		arg.Email,
		arg.Department,
		arg.Designation,
	)
	var i Teacher
	err := row.Scan(
		&i.Name,
		&i.Email,
		&i.Department,
		&i.Designation,
	)
	return i, err
}

const deleteTeacherByEmail = `-- name: DeleteTeacherByEmail :exec
DELETE FROM teacher WHERE email = $1
RETURNING name, email, department, designation
`

func (q *Queries) DeleteTeacherByEmail(ctx context.Context, email string) error {
	_, err := q.db.ExecContext(ctx, deleteTeacherByEmail, email)
	return err
}

const getTeacherByEmail = `-- name: GetTeacherByEmail :one
SELECT name, email, department, designation FROM teacher WHERE email = $1
`

func (q *Queries) GetTeacherByEmail(ctx context.Context, email string) (Teacher, error) {
	row := q.db.QueryRowContext(ctx, getTeacherByEmail, email)
	var i Teacher
	err := row.Scan(
		&i.Name,
		&i.Email,
		&i.Department,
		&i.Designation,
	)
	return i, err
}

const getTeachers = `-- name: GetTeachers :many
SELECT name, email, department, designation FROM teacher LIMIT $1 OFFSET $2
`

type GetTeachersParams struct {
	Limit  int32 `json:"limit"`
	Offset int32 `json:"offset"`
}

func (q *Queries) GetTeachers(ctx context.Context, arg GetTeachersParams) ([]Teacher, error) {
	rows, err := q.db.QueryContext(ctx, getTeachers, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Teacher
	for rows.Next() {
		var i Teacher
		if err := rows.Scan(
			&i.Name,
			&i.Email,
			&i.Department,
			&i.Designation,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateTeacherByEmail = `-- name: UpdateTeacherByEmail :exec
UPDATE teacher
SET name = $2, department = $3, designation = $4
WHERE email = $1
RETURNING name, email, department, designation
`

type UpdateTeacherByEmailParams struct {
	Email       string         `json:"email"`
	Name        sql.NullString `json:"name"`
	Department  sql.NullString `json:"department"`
	Designation sql.NullString `json:"designation"`
}

func (q *Queries) UpdateTeacherByEmail(ctx context.Context, arg UpdateTeacherByEmailParams) error {
	_, err := q.db.ExecContext(ctx, updateTeacherByEmail,
		arg.Email,
		arg.Name,
		arg.Department,
		arg.Designation,
	)
	return err
}
