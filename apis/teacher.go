package api

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	db "github.com/nirajan1111/routiney/db/sqlc"
	"github.com/nirajan1111/routiney/token"
)

type addTeacherRequest struct {
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Department  string `json:"department" binding:"required"`
	Designation string `json:"designation" binding:"required"`
}
type addTeacherResponse struct {
	Email       string `json:"email"`
	Name        string `json:"name"`
	Department  string `json:"department"`
	Designation string `json:"designation"`
}

func TeacherToResponse(teacher db.Teacher) addTeacherResponse {
	return addTeacherResponse{
		Email:       teacher.Email,
		Name:        teacher.Name.String,
		Department:  teacher.Department.String,
		Designation: teacher.Designation.String,
	}
}

func StringToSQLNullString(s string) sql.NullString {
	return sql.NullString{
		String: s,
		Valid:  true,
	}
}

func SQLNullStringToString(s sql.NullString) string {
	if s.Valid {
		return s.String
	}
	return ""
}

func SQLNullInt64ToInt64(s sql.NullInt64) int64 {
	if s.Valid {
		return s.Int64
	}
	return 0
}

func checkAdmin(ctx context.Context, role string) (bool, error) {
	userPayload, exists := ctx.Value("user").(*token.Payload)
	if !exists {
		return false, fmt.Errorf("not authenticated")
	}
	return userPayload.Role == role, nil
}

func (server *Server) addTeacher(ctx *gin.Context) {
	var req addTeacherRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	arg := db.CreateTeacherParams{
		Name:        StringToSQLNullString(req.Name),
		Email:       req.Email,
		Department:  StringToSQLNullString(req.Department),
		Designation: StringToSQLNullString(req.Designation),
	}
	fmt.Printf("Creating teacher with email: %s", arg.Email)
	teacher, err := server.store.CreateTeacher(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	res := TeacherToResponse(teacher)
	ctx.JSON(http.StatusOK, res)
}

func (server *Server) getTeacher(ctx *gin.Context) {
	admin_status, err := checkAdmin(ctx, "admin")
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}
	if !admin_status {
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to view all teachers")))
		return
	}
	email := ctx.Param("email")
	teacher, err := server.store.GetTeacherByEmail(ctx, email)
	if err != nil {
		ctx.JSON(http.StatusNotFound, errorResponse(err))
		return
	}
	res := TeacherToResponse(teacher)
	ctx.JSON(http.StatusOK, res)
}
func (server *Server) deleteTeacher(ctx *gin.Context) {
	admin_status, err := checkAdmin(ctx, "admin")
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}
	if !admin_status {
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to view all teachers")))
		return
	}
	email := ctx.Param("email")
	err_ := server.store.DeleteTeacherByEmail(ctx, email)
	if err_ != nil {
		ctx.JSON(http.StatusNotFound, errorResponse(err))
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Teacher deleted successfully"})
}

func (server *Server) getAllTeachers(ctx *gin.Context) {
	admin_status, err := checkAdmin(ctx, "admin")
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}
	if !admin_status {
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to view all teachers")))
		return
	}
	limit := ctx.Query("limit")
	offset := ctx.Query("offset")
	if limit == "" {
		limit = "10"
	}
	if offset == "" {
		offset = "0"
	}
	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	offsetInt, err := strconv.Atoi(offset)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	arg := db.GetTeachersParams{
		Limit:  int32(limitInt),
		Offset: int32(offsetInt),
	}

	teachers, err := server.store.GetTeachers(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusNotFound, errorResponse(err))
		return
	}
	res := make([]addTeacherResponse, len(teachers))
	for i, teacher := range teachers {
		res[i] = TeacherToResponse(teacher)
	}
	ctx.JSON(http.StatusOK, res)
}

func (server *Server) getMe(ctx *gin.Context) {
	userPayload, exists := ctx.Get("user")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, errorResponse(fmt.Errorf("not authenticated")))
		return
	}

	payload, ok := userPayload.(*token.Payload)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, errorResponse(fmt.Errorf("invalid token payload")))
		return
	}

	teacher, err := server.store.GetTeacherByEmail(ctx, payload.Email)
	if err != nil {
		ctx.JSON(http.StatusNotFound, errorResponse(err))
		return
	}

	res := TeacherToResponse(teacher)
	ctx.JSON(http.StatusOK, res)
}

func (server *Server) updateTeacher(ctx *gin.Context) {
	// admin_status, err := checkAdmin(ctx, "admin")
	// if err != nil {
	// 	ctx.JSON(http.StatusUnauthorized, errorResponse(err))
	// 	return
	// }
	// if !admin_status {
	// 	ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to view all teachers")))
	// 	return
	// }
	fmt.Println("Inside update teacher")
	email := ctx.Param("email")
	var req addTeacherRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	arg := db.UpdateTeacherByEmailParams{
		Name:        StringToSQLNullString(req.Name),
		Email:       email,
		Department:  StringToSQLNullString(req.Department),
		Designation: StringToSQLNullString(req.Designation),
	}
	fmt.Printf("Creating teacher with email: %s", arg.Email)
	err_ := server.store.UpdateTeacherByEmail(ctx, arg)
	if err_ != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err_))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Teacher updated successfully"})
}
