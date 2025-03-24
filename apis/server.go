package api

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
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
		accessTokenDuration = 100 * time.Minute
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
	router.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	server.setRouter(router)

	server.router = router
	return server, nil
}
func headRooms(c *gin.Context) {
	c.Status(http.StatusOK) // 200 OK without a body
}

func (server *Server) setRouter(router *gin.Engine) {
	router.GET("/ping", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{"message": "pong"})
	})
	router.POST("/users/login", server.loginUser)
	router.POST("/users", server.createUser)
	router.HEAD("/", headRooms)
	authRoutes := router.Group("/").Use(AuthMiddleware(server.tokenMaker))
	authRoutes.GET("/users/:email", server.getUser)
	authRoutes.GET("/users", server.listUsers)

	authRoutes.POST("/teachers", server.addTeacher)
	authRoutes.GET("/teachers/:email", server.getTeacher)
	authRoutes.GET("/teachers", server.getAllTeachers)
	authRoutes.PUT("/teachers/:email", server.updateTeacher)
	authRoutes.DELETE("/teachers/:email", server.deleteTeacher)
	authRoutes.GET("/get_me_teacher", server.getMe)

	authRoutes.POST("/rooms", server.addRoom)
	authRoutes.GET("/rooms/:room_code", server.getRoom)
	router.GET("/rooms", server.listRooms)
	authRoutes.PUT("/rooms/:id", server.updateRoom)
	authRoutes.DELETE("/rooms/:id", server.deleteRoom)

	authRoutes.POST("/subjects", server.createSubject)
	authRoutes.GET("/subjects/:id", server.getSubject)
	router.GET("/subjects", server.listSubjects)
	authRoutes.PUT("/subjects/:id", server.updateSubject)
	authRoutes.DELETE("/subjects/:id", server.deleteSubject)
	authRoutes.POST("/subject/:id/:email", server.assignTeacherToSubject)
	authRoutes.GET("/subject/:id/teachers", server.getAssignedTeacher)
	authRoutes.GET("/subject/remove/:id/:email", server.removeTeacherFromSubject)

	authRoutes.POST("/student-sections", server.createStudentSection)
	authRoutes.GET("/student-sections/:id", server.getStudentSection)
	router.GET("/student-sections", server.listStudentSections)
	authRoutes.PUT("/student-sections/:id", server.updateStudentSection)
	authRoutes.DELETE("/student-sections/:id", server.deleteStudentSection)
	authRoutes.GET("/student-sections/:id/students", server.getStudentsInSection)

	router.GET("/schedules/room/:room_id", server.getSchedulesByRoom)
	router.GET("/schedules/group/:group_id", server.getSchedulesByGroup)

	authRoutes.POST("/schedules", server.createSchedule)
	authRoutes.GET("/schedules/teacher/:email", server.getSchedulesByTeacher)

	authRoutes.PUT("/schedules/:id", server.updateSchedule)
	authRoutes.DELETE("/schedules/:id", server.deleteSchedule)

	router.GET("/years/schedules", server.getAvailableYears)
}

func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

func errorResponse(err error) gin.H {
	return gin.H{"error": err.Error()}
}

func (server *Server) Router() *gin.Engine {
	return server.router
}
