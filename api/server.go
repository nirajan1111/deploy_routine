package api

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	db "github.com/nirajan1111/routiney/db/sqlc"
	"github.com/nirajan1111/routiney/token"
)

type Server struct {
	store               *db.Store
	router              *gin.Engine
	tokenMaker          token.Maker
	accessTokenDuration time.Duration
}

func NewServer(store *db.Store, accessTokenSymmetricKey string, accessTokenDuration time.Duration) (*Server, error) {
	if accessTokenDuration <= 0 {
		accessTokenDuration = 15 * time.Minute
	}

	tokenMaker, err := token.NewPasetoMaker([]byte(accessTokenSymmetricKey))
	if err != nil {

		return nil, fmt.Errorf("cannot create token maker")
	}
	server := &Server{
		store:               store,
		tokenMaker:          tokenMaker,
		accessTokenDuration: accessTokenDuration,
	}
	router := gin.Default()
	server.setRouter(router)

	server.router = router
	return server, nil
}
func (server *Server) setRouter(router *gin.Engine) {
	router.POST("/users/login", server.loginUser)

	router.POST("/users", server.createUser)
	authRoutes := router.Group("/").Use(authMiddleware(server.tokenMaker))
	authRoutes.GET("/users/:email", server.getUser)
	authRoutes.GET("/users", server.listUsers)
}

func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

func errorResponse(err error) gin.H {
	return gin.H{"error": err.Error()}
}
