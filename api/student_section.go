package api

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	db "github.com/nirajan1111/routiney/db/sqlc"
)

// Request/Response Types
type createStudentSectionRequest struct {
	Name         string `json:"name" binding:"required"`
	Program      string `json:"program" binding:"required"`
	YearEnrolled int32  `json:"year_enrolled" binding:"required"`
	GroupName    string `json:"group_name" binding:"required"`
	Department   string `json:"department" binding:"required"`
}

type studentSectionResponse struct {
	ID           int32  `json:"id"`
	Name         string `json:"name"`
	Program      string `json:"program"`
	YearEnrolled int32  `json:"year_enrolled"`
	GroupName    string `json:"group_name"`
	Department   string `json:"department"`
}

type getStudentSectionRequest struct {
	ID int32 `uri:"id" binding:"required,min=1"`
}

type listStudentSectionsRequest struct {
	Limit      int32  `form:"limit" binding:"required,min=1,max=100"`
	Offset     int32  `form:"offset" binding:"min=0"`
	Department string `form:"department"`
	Program    string `form:"program"`
	Year       int32  `form:"year"`
}

type updateStudentSectionRequest struct {
	Name         string `json:"name"`
	Program      string `json:"program"`
	YearEnrolled int32  `json:"year_enrolled"`
	GroupName    string `json:"group_name"`
	Department   string `json:"department"`
}

func newStudentSectionResponse(section db.StudentSection) studentSectionResponse {
	return studentSectionResponse{
		ID:           section.ID,
		Name:         SQLNullStringToString(section.Name),
		Program:      SQLNullStringToString(section.Program),
		YearEnrolled: section.YearEnrolled.Int32,
		GroupName:    SQLNullStringToString(section.GroupName),
		Department:   SQLNullStringToString(section.Department),
	}

}

func (server *Server) createStudentSection(ctx *gin.Context) {
	var req createStudentSectionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Check if user has admin rights
	adminStatus, err := checkAdmin(ctx, "admin")
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}
	if !adminStatus {
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to create student sections")))
		return
	}

	count, err := server.store.CountStudentSections(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	newID := int32(count + 1)

	arg := db.CreateStudentSectionParams{
		ID:      newID,
		Name:    StringToSQLNullString(req.Name),
		Program: StringToSQLNullString(req.Program),
		YearEnrolled: sql.NullInt32{
			Int32: req.YearEnrolled,
			Valid: req.YearEnrolled != 0,
		},
		GroupName:  StringToSQLNullString(req.GroupName),
		Department: StringToSQLNullString(req.Department),
	}

	section, err := server.store.CreateStudentSection(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	res := newStudentSectionResponse(section)
	ctx.JSON(http.StatusOK, res)
}

// Get student section by ID
func (server *Server) getStudentSection(ctx *gin.Context) {
	var req getStudentSectionRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	section, err := server.store.GetStudentSection(ctx, req.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("student section not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	res := newStudentSectionResponse(section)
	ctx.JSON(http.StatusOK, res)
}

// List all student sections with pagination
func (server *Server) listStudentSections(ctx *gin.Context) {
	var req listStudentSectionsRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var sections []db.StudentSection
	var err error

	if req.Department != "" {
		sections, err = server.store.GetStudentSectionsByDepartment(ctx, StringToSQLNullString(req.Department))
	} else if req.Program != "" {
		sections, err = server.store.GetStudentSectionsByProgram(ctx, StringToSQLNullString(req.Program))
	} else if req.Year != 0 {
		sections, err = server.store.GetStudentSectionsByYear(ctx, sql.NullInt32{
			Int32: req.Year,
			Valid: req.Year != 0,
		})
	} else {
		arg := db.ListStudentSectionsParams{
			Limit:  req.Limit,
			Offset: req.Offset,
		}
		sections, err = server.store.ListStudentSections(ctx, arg)
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if len(sections) == 0 {
		ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("no student sections found")))
		return
	}

	var sectionResponses []studentSectionResponse
	for _, section := range sections {
		sectionResponses = append(sectionResponses, newStudentSectionResponse(section))
	}

	ctx.JSON(http.StatusOK, sectionResponses)
}

// Update student section
func (server *Server) updateStudentSection(ctx *gin.Context) {
	var uri getStudentSectionRequest
	var req updateStudentSectionRequest

	if err := ctx.ShouldBindUri(&uri); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Check if user has admin rights
	adminStatus, err := checkAdmin(ctx, "admin")
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}
	if !adminStatus {
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to update student sections")))
		return
	}

	// Get current section to ensure it exists
	_, err = server.store.GetStudentSection(ctx, uri.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("student section not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	arg := db.UpdateStudentSectionParams{
		ID:      uri.ID,
		Name:    StringToSQLNullString(req.Name),
		Program: StringToSQLNullString(req.Program),
		YearEnrolled: sql.NullInt32{

			Int32: req.YearEnrolled,
			Valid: req.YearEnrolled != 0,
		},
		GroupName:  StringToSQLNullString(req.GroupName),
		Department: StringToSQLNullString(req.Department),
	}

	updatedSection, err := server.store.UpdateStudentSection(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	res := newStudentSectionResponse(updatedSection)
	ctx.JSON(http.StatusOK, res)
}

// Delete student section
func (server *Server) deleteStudentSection(ctx *gin.Context) {
	var req getStudentSectionRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Check if user has admin rights
	adminStatus, err := checkAdmin(ctx, "admin")
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}
	if !adminStatus {
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to delete student sections")))
		return
	}

	err = server.store.DeleteStudentSection(ctx, req.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Student section deleted successfully"})
}

// Get students in section
func (server *Server) getStudentsInSection(ctx *gin.Context) {
	var req getStudentSectionRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	students, err := server.store.GetStudentsInSection(ctx, req.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if len(students) == 0 {
		ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("no students found in this section")))
		return
	}

	// Convert to response format
	// You would need a studentResponse type and conversion function
	ctx.JSON(http.StatusOK, students)
}
