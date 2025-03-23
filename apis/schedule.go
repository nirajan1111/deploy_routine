package apis

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	db "github.com/nirajan1111/routiney/db/sqlc"
)

// Request/Response Types
type createScheduleRequest struct {
	GroupID      int64  `json:"group_id" binding:"required"`
	RoomID       int64  `json:"room_id" binding:"required"`
	SubjectID    int64  `json:"subject_id" binding:"required"`
	TeacherEmail string `json:"teacher_email" binding:"required,email"`
	TimeSlot     string `json:"time_slot" binding:"required"`
	Year         int32  `json:"year" binding:"required"`
}

type scheduleResponse struct {
	ID           int64  `json:"id"`
	GroupID      int64  `json:"group_id,omitempty"`
	RoomID       int64  `json:"room_id,omitempty"`
	SubjectID    int64  `json:"subject_id,omitempty"`
	TeacherEmail string `json:"teacher_email,omitempty"`
	TimeSlot     string `json:"time_slot,omitempty"`
	Year         int32  `json:"year,omitempty"`
}

type detailedScheduleResponse struct {
	ID                 int64  `json:"id"`
	GroupID            int64  `json:"group_id,omitempty"`
	RoomID             int64  `json:"room_id,omitempty"`
	SubjectID          int64  `json:"subject_id,omitempty"`
	TeacherEmail       string `json:"teacher_email,omitempty"`
	TimeSlot           string `json:"time_slot,omitempty"`
	Year               int32  `json:"year,omitempty"`
	TeacherName        string `json:"teacher_name,omitempty"`
	RoomCode           string `json:"room_code,omitempty"`
	BlockNo            string `json:"block_no,omitempty"`
	SubjectCode        string `json:"subject_code,omitempty"`
	SubjectName        string `json:"subject_name,omitempty"`
	GroupName          string `json:"group_name,omitempty"`
	TeacherDesignation string `json:"teacher_designation,omitempty"`
}

type getScheduleRequest struct {
	ID int64 `uri:"id" binding:"required,min=1"`
}

type listSchedulesRequest struct {
	Limit  int32 `form:"limit" binding:"required,min=1,max=100"`
	Offset int32 `form:"offset" binding:"min=0"`
}

type updateScheduleRequest struct {
	GroupID      int64  `json:"group_id"`
	RoomID       int64  `json:"room_id"`
	SubjectID    int64  `json:"subject_id"`
	TeacherEmail string `json:"teacher_email"`
	TimeSlot     string `json:"time_slot"`
	Year         int32  `json:"year"`
}

type checkConflictRequest struct {
	TimeSlot     string `json:"time_slot" binding:"required"`
	RoomID       int64  `json:"room_id" binding:"required"`
	TeacherEmail string `json:"teacher_email" binding:"required,email"`
	GroupID      int64  `json:"group_id" binding:"required"`
}

// Helper function to convert DB schedule to API response
func newScheduleResponse(schedule db.Schedule) scheduleResponse {
	return scheduleResponse{
		ID:           schedule.ID,
		GroupID:      schedule.GroupID.Int64,
		RoomID:       schedule.RoomID.Int64,
		SubjectID:    schedule.SubjectID.Int64,
		TeacherEmail: schedule.TeacherEmail.String,
		TimeSlot:     schedule.TimeSlot.String,
		Year:         schedule.Year,
	}
}

func newDetailedScheduleByTeacherResponse(schedule db.GetSchedulesByTeacherRow) detailedScheduleResponse {
	return detailedScheduleResponse{
		ID:                 schedule.ID,
		GroupID:            schedule.GroupID.Int64,
		RoomID:             schedule.RoomID.Int64,
		SubjectID:          schedule.SubjectID.Int64,
		TeacherEmail:       schedule.TeacherEmail.String,
		TimeSlot:           schedule.TimeSlot.String,
		Year:               schedule.Year,
		TeacherName:        schedule.TeacherName.String,
		RoomCode:           schedule.RoomCode.String,
		BlockNo:            schedule.BlockNo.String,
		SubjectCode:        schedule.SubjectCode.String,
		SubjectName:        schedule.SubjectName.String,
		GroupName:          schedule.GroupName.String,
		TeacherDesignation: schedule.TeacherDesignation.String,
	}
}

func newDetailedScheduleByRoomResponse(schedule db.GetSchedulesByRoomRow) detailedScheduleResponse {
	return detailedScheduleResponse{
		ID:                 schedule.ID,
		GroupID:            schedule.GroupID.Int64,
		RoomID:             schedule.RoomID.Int64,
		SubjectID:          schedule.SubjectID.Int64,
		TeacherEmail:       schedule.TeacherEmail.String,
		TimeSlot:           schedule.TimeSlot.String,
		TeacherName:        schedule.TeacherName.String,
		Year:               schedule.Year,
		RoomCode:           schedule.RoomCode.String,
		BlockNo:            schedule.BlockNo.String,
		SubjectCode:        schedule.SubjectCode.String,
		SubjectName:        schedule.SubjectName.String,
		GroupName:          schedule.GroupName.String,
		TeacherDesignation: schedule.TeacherDesignation.String,
	}
}

func newDetailedScheduleByGroupResponse(schedule db.GetSchedulesByGroupRow) detailedScheduleResponse {
	return detailedScheduleResponse{
		ID:                 schedule.ID,
		GroupID:            schedule.GroupID.Int64,
		RoomID:             schedule.RoomID.Int64,
		SubjectID:          schedule.SubjectID.Int64,
		TeacherEmail:       schedule.TeacherEmail.String,
		TimeSlot:           schedule.TimeSlot.String,
		TeacherName:        schedule.TeacherName.String,
		Year:               schedule.Year,
		RoomCode:           schedule.RoomCode.String,
		BlockNo:            schedule.BlockNo.String,
		SubjectCode:        schedule.SubjectCode.String,
		SubjectName:        schedule.SubjectName.String,
		GroupName:          schedule.GroupName.String,
		TeacherDesignation: schedule.TeacherDesignation.String,
	}
}

func getNepaliYear() int {
	currentYear := time.Now().Year()
	currentMonth := time.Now().Month()
	currentDay := time.Now().Day()

	if currentMonth < 4 || (currentMonth == 4 && currentDay < 14) {
		return currentYear + 56
	}
	return currentYear + 57
}

func (server *Server) createSchedule(ctx *gin.Context) {
	var req createScheduleRequest
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
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to create schedules")))
		return
	}
	if req.Year == 0 {
		req.Year = int32(getNepaliYear())
	}

	conflictParams := db.CheckScheduleConflictsParams{
		TimeSlot: StringToSQLNullString(req.TimeSlot),
		RoomID: sql.NullInt64{
			Int64: req.RoomID,
			Valid: true,
		},
		TeacherEmail: StringToSQLNullString(req.TeacherEmail),
		GroupID: sql.NullInt64{
			Int64: req.GroupID,
			Valid: true,
		},
	}

	hasConflict, err := server.store.CheckScheduleConflicts(ctx, conflictParams)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if hasConflict {
		ctx.JSON(http.StatusConflict, errorResponse(fmt.Errorf("schedule conflict detected: room, teacher, or group already scheduled for this time slot")))
		return
	}

	arg := db.CreateScheduleParams{
		GroupID: sql.NullInt64{
			Int64: req.GroupID,
			Valid: true,
		},
		RoomID: sql.NullInt64{
			Int64: req.RoomID,
			Valid: true,
		},
		SubjectID: sql.NullInt64{
			Int64: req.SubjectID,
			Valid: true,
		},
		TeacherEmail: StringToSQLNullString(req.TeacherEmail),
		TimeSlot:     StringToSQLNullString(req.TimeSlot),
		Year:         req.Year,
	}

	schedule, err := server.store.CreateSchedule(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	res := newScheduleResponse(schedule)
	ctx.JSON(http.StatusOK, res)
}

// Update schedule
func (server *Server) updateSchedule(ctx *gin.Context) {
	var uri getScheduleRequest
	var req updateScheduleRequest

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
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to update schedules")))
		return
	}

	// Get current schedule to ensure it exists
	_, err = server.store.GetSchedule(ctx, uri.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("schedule not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	arg := db.UpdateScheduleParams{
		ID: uri.ID,
		GroupID: sql.NullInt64{
			Int64: req.GroupID,
			Valid: req.GroupID != 0,
		},
		RoomID: sql.NullInt64{
			Int64: req.RoomID,
			Valid: req.RoomID != 0,
		},
		SubjectID: sql.NullInt64{
			Int64: req.SubjectID,
			Valid: req.SubjectID != 0,
		},
		TeacherEmail: StringToSQLNullString(req.TeacherEmail),
		TimeSlot:     StringToSQLNullString(req.TimeSlot),
	}

	updatedSchedule, err := server.store.UpdateSchedule(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	res := newScheduleResponse(updatedSchedule)
	ctx.JSON(http.StatusOK, res)
}

func (server *Server) deleteSchedule(ctx *gin.Context) {
	var req getScheduleRequest
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
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to delete schedules")))
		return
	}

	err = server.store.DeleteSchedule(ctx, req.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Schedule deleted successfully"})
}

func (server *Server) getSchedulesByTeacher(ctx *gin.Context) {
	teacherEmail := ctx.Param("email")
	if teacherEmail == "" {
		ctx.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("teacher email is required")))
		return
	}

	yearStr := ctx.Query("year")
	if yearStr == "" {
		yearStr = strconv.Itoa(getNepaliYear())
	}

	yearInt, err := strconv.Atoi(yearStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("invalid year")))
		return
	}

	// Convert to int32
	year := int32(yearInt)

	// Create query parameters with year
	arg := db.GetSchedulesByTeacherParams{
		TeacherEmail: StringToSQLNullString(teacherEmail),
		Year:         year,
	}

	schedules, err := server.store.GetSchedulesByTeacher(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	scheduleResponses := make([]detailedScheduleResponse, 0)
	for _, schedule := range schedules {
		scheduleResponses = append(scheduleResponses, newDetailedScheduleByTeacherResponse(schedule))
	}

	ctx.JSON(http.StatusOK, scheduleResponses)
}

func (server *Server) getSchedulesByRoom(ctx *gin.Context) {
	roomIDStr := ctx.Param("room_id")
	if roomIDStr == "" {
		ctx.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("room ID is required")))
		return
	}

	roomID, err := strconv.ParseInt(roomIDStr, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("invalid room ID")))
		return
	}

	// Extract year from query parameters
	yearStr := ctx.Query("year")
	if yearStr == "" {
		yearStr = strconv.Itoa(getNepaliYear())
	}

	yearInt, err := strconv.Atoi(yearStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("invalid year")))
		return
	}

	// Convert to int32
	year := int32(yearInt)

	// Create query parameters
	arg := db.GetSchedulesByRoomParams{
		RoomID: sql.NullInt64{
			Int64: roomID,
			Valid: true,
		},
		Year: year,
	}

	// Use the arg parameter that includes both room ID and year
	schedules, err := server.store.GetSchedulesByRoom(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Return empty array if no schedules found
	scheduleResponses := make([]detailedScheduleResponse, 0)
	for _, schedule := range schedules {
		scheduleResponses = append(scheduleResponses, newDetailedScheduleByRoomResponse(schedule))
	}

	ctx.JSON(http.StatusOK, scheduleResponses)
}

// Get schedules by group
func (server *Server) getSchedulesByGroup(ctx *gin.Context) {
	groupIDStr := ctx.Param("group_id")
	if groupIDStr == "" {
		ctx.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("group ID is required")))
		return
	}

	groupID, err := strconv.ParseInt(groupIDStr, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("invalid group ID")))
		return
	}

	// Extract year from query parameters
	yearStr := ctx.Query("year")
	if yearStr == "" {
		yearStr = strconv.Itoa(getNepaliYear())
	}

	yearInt, err := strconv.Atoi(yearStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("invalid year")))
		return
	}

	// Convert to int32
	year := int32(yearInt)

	// Create query parameters with year
	arg := db.GetSchedulesByGroupParams{
		GroupID: sql.NullInt64{
			Int64: groupID,
			Valid: true,
		},
		Year: year,
	}

	schedules, err := server.store.GetSchedulesByGroup(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	scheduleResponses := make([]detailedScheduleResponse, 0)
	for _, schedule := range schedules {
		scheduleResponses = append(scheduleResponses, newDetailedScheduleByGroupResponse(schedule))
	}

	ctx.JSON(http.StatusOK, scheduleResponses)
}

func (server *Server) getAvailableYears(ctx *gin.Context) {
	years, err := server.store.GetDistinctYears(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// If no years found, return the current Nepali year in an array
	if len(years) == 0 {
		currentYear := int32(getNepaliYear())
		years = []int32{currentYear}
	}

	// Return years in a proper JSON structure
	response := gin.H{
		"years": years,
	}

	ctx.JSON(http.StatusOK, response)
}
