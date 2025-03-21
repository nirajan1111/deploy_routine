package db

import (
	"context"
	"database/sql"
)

// Store provides all functions to execute db queries
type Store struct {
	db *sql.DB
	*Queries
}

// NewStore creates a new store
func NewStore(db *sql.DB) *Store {
	return &Store{
		db:      db,
		Queries: New(db),
	}
}
func (store *Store) Createuser(ctx context.Context, arg CreateuserParams) (User, error) {
	return store.Queries.Createuser(ctx, arg)
}
func (store *Store) GetUser(ctx context.Context, email string) (User, error) {
	return store.Queries.GetuserByEmail(ctx, email)
}
func (store *Store) ListUsers(ctx context.Context, arg GetusersParams) ([]User, error) {
	return store.Queries.Getusers(ctx, arg)
}
