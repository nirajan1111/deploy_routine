package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	db "github.com/nirajan1111/routiney/db/sqlc"
)

type createSubjectRequest struct {
	SubjectCode string `json:"subject_code" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Department  string `json:"department" binding:"required"`
}

type subjectResponse struct {
	ID          int64  `json:"id"`
	SubjectCode string `json:"subject_code"`
	Name        string `json:"name"`
	Department  string `json:"department"`
}

type getSubjectRequest struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

type listSubjectsRequest struct {
	Limit      int32  `form:"limit" binding:"required,min=1,max=100"`
	Offset     int32  `form:"offset" binding:"min=0"`
	Department string `form:"department"`
}

type updateSubjectRequest struct {
	ID          int64  `uri:"id" binding:"required,min=1"`
	SubjectCode string `json:"subject_code"`
	Name        string `json:"name"`
	Department  string `json:"department"`
}

type deleteSubjectRequest struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

// Helper function to convert DB subject to API response
func newSubjectResponse(subject db.Subject) subjectResponse {
	return subjectResponse{
		ID:          subject.ID,
		SubjectCode: SQLNullStringToString(subject.SubjectCode),
		Name:        SQLNullStringToString(subject.Name),
		Department:  SQLNullStringToString(subject.Department),
	}
}

func (server *Server) createSubject(ctx *gin.Context) {
	var req createSubjectRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	adminStatus, err := checkAdmin(ctx, "admin")
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}
	if !adminStatus {
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to create subjects")))
		return
	}

	maxID, err := server.store.CountSubjects(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	arg := db.CreateSubjectParams{
		ID:          maxID + 1,
		SubjectCode: StringToSQLNullString(req.SubjectCode),
		Name:        StringToSQLNullString(req.Name),
		Department:  StringToSQLNullString(req.Department),
	}

	subject, err := server.store.CreateSubject(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	res := newSubjectResponse(subject)
	ctx.JSON(http.StatusOK, res)
}

func (server *Server) getSubject(ctx *gin.Context) {
	var req getSubjectRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	subject, err := server.store.GetSubject(ctx, req.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("subject not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	res := newSubjectResponse(subject)
	ctx.JSON(http.StatusOK, res)
}

func (server *Server) listSubjects(ctx *gin.Context) {
	var req listSubjectsRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var subjects []db.Subject
	var err error

	if req.Department != "" {
		subjects, err = server.store.GetSubjectsByDepartment(ctx, StringToSQLNullString(req.Department))
	} else {
		arg := db.ListSubjectsParams{
			Limit:  req.Limit,
			Offset: req.Offset,
		}
		subjects, err = server.store.ListSubjects(ctx, arg)
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if len(subjects) == 0 {
		ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("no subjects found")))
		return
	}

	var subjectResponses []subjectResponse
	for _, subject := range subjects {
		subjectResponses = append(subjectResponses, newSubjectResponse(subject))
	}

	ctx.JSON(http.StatusOK, subjectResponses)
}

func (server *Server) updateSubject(ctx *gin.Context) {
	var uri getSubjectRequest
	var req updateSubjectRequest

	if err := ctx.ShouldBindUri(&uri); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	adminStatus, err := checkAdmin(ctx, "admin")
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}
	if !adminStatus {
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to update subjects")))
		return
	}

	subject, err := server.store.GetSubject(ctx, uri.ID)

	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("subject with not found", subject.ID)))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	arg := db.UpdateSubjectParams{
		ID:          uri.ID,
		SubjectCode: StringToSQLNullString(req.SubjectCode),
		Name:        StringToSQLNullString(req.Name),
		Department:  StringToSQLNullString(req.Department),
	}

	updatedSubject, err := server.store.UpdateSubject(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	res := newSubjectResponse(updatedSubject)
	ctx.JSON(http.StatusOK, res)
}

func (server *Server) deleteSubject(ctx *gin.Context) {
	var req deleteSubjectRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	adminStatus, err := checkAdmin(ctx, "admin")
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}
	if !adminStatus {
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to delete subjects")))
		return
	}

	err = server.store.DeleteSubject(ctx, req.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Subject deleted successfully"})
}

// Assign teacher to subject
func (server *Server) assignTeacherToSubject(ctx *gin.Context) {
	subjectID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	teacherEmail := ctx.Param("email")
	if teacherEmail == "" {
		ctx.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("teacher email is required")))
		return
	}

	adminStatus, err := checkAdmin(ctx, "admin")
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}
	if !adminStatus {
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to assign teachers")))
		return
	}

	arg := db.AssignTeacherToSubjectParams{
		SubjectID:    subjectID,
		TeacherEmail: teacherEmail,
	}

	err = server.store.AssignTeacherToSubject(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Teacher assigned to subject successfully"})
}

func (server *Server) removeTeacherFromSubject(ctx *gin.Context) {
	subjectID, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	teacherEmail := ctx.Param("email")
	if teacherEmail == "" {
		ctx.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("teacher email is required")))
		return
	}

	adminStatus, err := checkAdmin(ctx, "admin")
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}
	if !adminStatus {
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to remove teachers")))
		return
	}

	arg := db.RemoveTeacherFromSubjectParams{
		SubjectID:    subjectID,
		TeacherEmail: teacherEmail,
	}

	err = server.store.RemoveTeacherFromSubject(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Teacher removed from subject successfully"})
}
