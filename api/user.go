package api

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	db "github.com/nirajan1111/routiney/db/sqlc"
)

type createUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role" binding:"required,oneof=admin student teacher"`
}
type getUserRequest struct {
	Email string `uri:"email" binding:"required,email"`
}
type listUsersRequest struct {
	Limit  int32 `form:"limit" binding:"required,min=1,max=100"`
	Offset int32 `form:"offset" binding:"min=0"`
}

func UserRoleFromString(roleStr string) (db.UserRole, error) {
	switch roleStr {
	case "admin":
		return db.UserRoleAdmin, nil
	case "student":
		return db.UserRoleStudent, nil
	case "teacher":
		return db.UserRoleTeacher, nil
	default:
		return "", fmt.Errorf("invalid role: %s", roleStr)
	}
}
func (server *Server) createUser(ctx *gin.Context) {
	var req createUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	userRole, err := UserRoleFromString(req.Role)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.CreateuserParams{
		Email:    req.Email,
		Password: req.Password,
		Role:     userRole,
	}
	fmt.Printf("Creating user with email: %s", arg.Email)
	account, err := server.store.Createuser(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	ctx.JSON(http.StatusOK, account)

}

func (server *Server) getUser(ctx *gin.Context) {
	var req getUserRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	email := ctx.Params.ByName("email")
	if email == "" {
		ctx.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("email is required")))
		return
	}
	user, err := server.store.GetUser(ctx, email)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("user not found")))
			return
		}

		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return

	}

	ctx.JSON(http.StatusOK, user)
}

func (server *Server) listUsers(ctx *gin.Context) {
	var req listUsersRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.GetusersParams{
		Limit:  req.Limit,
		Offset: req.Offset,
	}
	users, err := server.store.ListUsers(ctx, arg)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("no users found")))
			return
		}
		fmt.Println("Error fetching users: ", err)
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	ctx.JSON(http.StatusOK, users)
}
