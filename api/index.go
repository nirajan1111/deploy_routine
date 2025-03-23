package main

import (
	"database/sql"
	"log"
	"net/url"
	"os"
	"time"

	_ "github.com/lib/pq"
	api "github.com/nirajan1111/routiney/apis"
	db "github.com/nirajan1111/routiney/db/sqlc"
	"github.com/nirajan1111/routiney/utils"
)

func main() {
	_, err := utils.LoadConfig(".")
	if err != nil {
		log.Fatal("cannot load config", err)
	}
	// dbDriver := config.DBDriver
	// dbSource := config.DBSource
	// serverAddress := config.ServerAddress
	// accessTokenSymmetricKey := config.AccessTokenSymmetricKey
	// accessTokenDuration := config.AccessTokenDuration
	dbDriver := "postgres"
	dbSource := os.Getenv("DB_SOURCE")
	serverAddress := os.Getenv("SERVER_ADDRESS")
	accessTokenSymmetricKey := os.Getenv("ACCESS_TOKEN_SYMMETRIC_KEY")

	accessTokenDuration := 1500 * time.Minute

	conn_url, _ := url.Parse(dbSource)
	conn_url.RawQuery = "sslmode=verify-ca;sslrootcert=ca.pem"
	conn, err := sql.Open(dbDriver, conn_url.String())

	if err != nil {
		log.Fatal("cannot connect to db", err)
	}
	store := db.NewStore(conn)
	server, err := api.NewServer(store, accessTokenSymmetricKey, accessTokenDuration)
	if err != nil {
		log.Fatal("cannot create server", err)
	}

	err = server.Start(serverAddress)
	if err != nil {
		log.Fatal("cannot start server", err)
	}

}
