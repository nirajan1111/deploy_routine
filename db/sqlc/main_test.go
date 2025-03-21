package db

import (
	"database/sql"
	"log"
	"net/url"
	"os"
	"testing"

	_ "github.com/lib/pq"
	"github.com/nirajan1111/routiney/utils"
)

var testQueries *Queries

func Testmain(m *testing.M) {
	config, err := utils.LoadConfig("../..")
	if err != nil {
		log.Fatal("cannot load config", err)
	}
	dbDriver := config.DBDriver
	dbSource := config.DBSource
	conn_url, _ := url.Parse(dbSource)
	conn_url.RawQuery = "sslmode=verify-ca;sslrootcert=ca.pem"
	conn, err := sql.Open(dbDriver, dbSource)
	if err != nil {
		log.Fatal("cannot connect to db", err)
	}
	defer conn.Close()
	os.Exit(m.Run())

}
