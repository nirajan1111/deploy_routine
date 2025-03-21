-- name: Createuser :one
INSERT INTO "user" (email, password, role)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetuserByEmail :one
SELECT * FROM "user" WHERE email = $1;

-- name: UpdateuserByEmail :exec
UPDATE "user"
SET email = $2, password = $3, role = $4
WHERE email = $1
RETURNING *;

-- name: DeleteuserByEmail :exec
DELETE FROM "user" WHERE email = $1
RETURNING *;

-- name: Getusers :many
SELECT * FROM "user" LIMIT $1 OFFSET $2;