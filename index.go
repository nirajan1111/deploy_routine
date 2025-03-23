package main

import (
	"database/sql"
	"log"
	"net/url"
	"os"
	"time"

	"github.com/joho/godotenv" // Add this import
	_ "github.com/lib/pq"
	api "github.com/nirajan1111/routiney/apis"
	db "github.com/nirajan1111/routiney/db/sqlc"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file:", err)
	}

	// Print the value to verify it's loaded
	key := os.Getenv("ACCESS_TOKEN_SYMMETRIC_KEY")
	log.Printf("Key loaded: %s (length: %d)", key, len(key))

	// Rest of your code using environment variables
	dbDriver := os.Getenv("DB_DRIVER")
	if dbDriver == "" {
		dbDriver = "postgres"
	}

	dbSource := os.Getenv("DB_SOURCE")
	serverAddress := os.Getenv("SERVER_ADDRESS")
	if serverAddress == "" {
		serverAddress = "localhost:8080"
	}

	accessTokenSymmetricKey := os.Getenv("ACCESS_TOKEN_SYMMETRIC_KEY")

	// Parse duration from string
	accessTokenDuration := 1500 * time.Minute
	expiry := os.Getenv("ACCESS_TOKEN_EXPIRY")
	if expiry != "" {
		duration, err := time.ParseDuration(expiry)
		if err == nil {
			accessTokenDuration = duration
		}
	}

	// Connect to database
	conn_url, _ := url.Parse(dbSource)
	conn_url.RawQuery = "sslmode=require"
	conn, err := sql.Open(dbDriver, conn_url.String())
	if err != nil {
		log.Fatal("cannot connect to db:", err)
	}

	store := db.NewStore(conn)
	server, err := api.NewServer(store, accessTokenSymmetricKey, accessTokenDuration)
	if err != nil {
		log.Fatal("cannot create server:", err)
	}

	log.Printf("Starting server on %s", serverAddress)
	err = server.Start(serverAddress)
	if err != nil {
		log.Fatal("cannot start server:", err)
	}
}
