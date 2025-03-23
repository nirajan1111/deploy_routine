package apis

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	db "github.com/nirajan1111/routiney/db/sqlc"
	"github.com/nirajan1111/routiney/utils"
)

type UserRole string
type NullString struct {
	sql.NullString
}
type NullInt64 struct {
	sql.NullInt64
}

func (ni NullInt64) MarshalJSON() ([]byte, error) {
	if !ni.Valid {
		return []byte("null"), nil
	}
	return json.Marshal(ni.Int64)
}

func (ns NullString) MarshalJSON() ([]byte, error) {
	if !ns.Valid {
		return []byte("null"), nil
	}
	return json.Marshal(ns.String)
}

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
type UserResponse struct {
	Email          string     `json:"email"`
	Role           UserRole   `json:"role"`
	Provider       NullString `json:"provider"`
	OauthID        NullString `json:"oauth_id"`
	ProfilePicture NullString `json:"profile_picture"`
	TeacherEmail   NullString `json:"teacher_email"`
	StudentID      NullInt64  `json:"student_id"`
}
type LoginUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}
type LoginUserResponse struct {
	AccessToken string       `json:"access_token"`
	User        UserResponse `json:"user"`
}

func newUserResponse(user db.User) UserResponse {
	return UserResponse{
		Email:          user.Email,
		Role:           UserRole(user.Role),
		Provider:       NullString{user.Provider},
		OauthID:        NullString{user.OauthID},
		ProfilePicture: NullString{user.ProfilePicture},
		TeacherEmail:   NullString{user.TeacherEmail},
		StudentID:      NullInt64{user.StudentID},
	}
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
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	arg := db.CreateuserParams{
		Email:    req.Email,
		Password: hashedPassword,
		Role:     userRole,
	}
	fmt.Printf("Creating user with email: %s", arg.Email)
	user, err := server.store.Createuser(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	res := newUserResponse(user)
	ctx.JSON(http.StatusOK, res)

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
	res := newUserResponse(user)
	ctx.JSON(http.StatusOK, res)
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
	var userResponses []UserResponse
	for _, user := range users {
		userResponse := newUserResponse(user)
		userResponses = append(userResponses, userResponse)
	}
	if len(userResponses) == 0 {
		ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("no users found")))
		return
	}

	ctx.JSON(http.StatusOK, userResponses)
}
func (server *Server) loginUser(ctx *gin.Context) {
	var req LoginUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	user, err := server.store.GetUser(ctx, req.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("user not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	if okay := utils.CheckPasswordHash(req.Password, user.Password); !okay {
		ctx.JSON(http.StatusUnauthorized, errorResponse(fmt.Errorf("invalid password")))
		return
	}
	accessToken, err := server.tokenMaker.CreateToken(user.Email, string(user.Role), server.accessTokenDuration)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	res := LoginUserResponse{
		AccessToken: accessToken,
		User:        newUserResponse(user),
	}
	ctx.JSON(http.StatusOK, res)
}
