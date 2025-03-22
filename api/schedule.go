package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

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
}

type scheduleResponse struct {
	ID           int64  `json:"id"`
	GroupID      int64  `json:"group_id,omitempty"`
	RoomID       int64  `json:"room_id,omitempty"`
	SubjectID    int64  `json:"subject_id,omitempty"`
	TeacherEmail string `json:"teacher_email,omitempty"`
	TimeSlot     string `json:"time_slot,omitempty"`
}

type detailedScheduleResponse struct {
	ID           int64  `json:"id"`
	GroupID      int64  `json:"group_id,omitempty"`
	RoomID       int64  `json:"room_id,omitempty"`
	SubjectID    int64  `json:"subject_id,omitempty"`
	TeacherEmail string `json:"teacher_email,omitempty"`
	TimeSlot     string `json:"time_slot,omitempty"`
	TeacherName  string `json:"teacher_name,omitempty"`
	RoomCode     string `json:"room_code,omitempty"`
	BlockNo      string `json:"block_no,omitempty"`
	SubjectCode  string `json:"subject_code,omitempty"`
	SubjectName  string `json:"subject_name,omitempty"`
	GroupName    string `json:"group_name,omitempty"`
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
	}
}

func newDetailedScheduleByTeacherResponse(schedule db.GetSchedulesByTeacherRow) detailedScheduleResponse {
	return detailedScheduleResponse{
		ID:           schedule.ID,
		GroupID:      schedule.GroupID.Int64,
		RoomID:       schedule.RoomID.Int64,
		SubjectID:    schedule.SubjectID.Int64,
		TeacherEmail: schedule.TeacherEmail.String,
		TimeSlot:     schedule.TimeSlot.String,
		TeacherName:  schedule.TeacherName.String,
		RoomCode:     schedule.RoomCode.String,
		BlockNo:      schedule.BlockNo.String,
		SubjectCode:  schedule.SubjectCode.String,
		SubjectName:  schedule.SubjectName.String,
		GroupName:    schedule.GroupName.String,
	}
}

func newDetailedScheduleByRoomResponse(schedule db.GetSchedulesByRoomRow) detailedScheduleResponse {
	return detailedScheduleResponse{
		ID:           schedule.ID,
		GroupID:      schedule.GroupID.Int64,
		RoomID:       schedule.RoomID.Int64,
		SubjectID:    schedule.SubjectID.Int64,
		TeacherEmail: schedule.TeacherEmail.String,
		TimeSlot:     schedule.TimeSlot.String,
		TeacherName:  schedule.TeacherName.String,
		RoomCode:     schedule.RoomCode.String,
		BlockNo:      schedule.BlockNo.String,
		SubjectCode:  schedule.SubjectCode.String,
		SubjectName:  schedule.SubjectName.String,
		GroupName:    schedule.GroupName.String,
	}
}

func newDetailedScheduleByGroupResponse(schedule db.GetSchedulesByGroupRow) detailedScheduleResponse {
	return detailedScheduleResponse{
		ID:           schedule.ID,
		GroupID:      schedule.GroupID.Int64,
		RoomID:       schedule.RoomID.Int64,
		SubjectID:    schedule.SubjectID.Int64,
		TeacherEmail: schedule.TeacherEmail.String,
		TimeSlot:     schedule.TimeSlot.String,
		TeacherName:  schedule.TeacherName.String,
		RoomCode:     schedule.RoomCode.String,
		BlockNo:      schedule.BlockNo.String,
		SubjectCode:  schedule.SubjectCode.String,
		SubjectName:  schedule.SubjectName.String,
		GroupName:    schedule.GroupName.String,
	}
}

// Create a new schedule
func (server *Server) createSchedule(ctx *gin.Context) {
	var req createScheduleRequest
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
		ctx.JSON(http.StatusForbidden, errorResponse(fmt.Errorf("not authorized to create schedules")))
		return
	}

	// Check for schedule conflicts before creating
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
	}

	schedule, err := server.store.CreateSchedule(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	res := newScheduleResponse(schedule)
	ctx.JSON(http.StatusOK, res)
}

// Get schedule by ID
func (server *Server) getSchedule(ctx *gin.Context) {
	var req getScheduleRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	schedule, err := server.store.GetSchedule(ctx, req.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("schedule not found")))
			return
		}
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

	// Check for schedule conflicts if time slot is being updated
	if req.TimeSlot != "" {
		conflictParams := db.CheckScheduleConflictsParams{
			TimeSlot: StringToSQLNullString(req.TimeSlot),
			RoomID: sql.NullInt64{
				Int64: req.RoomID,
				Valid: req.RoomID != 0,
			},
			TeacherEmail: StringToSQLNullString(req.TeacherEmail),
			GroupID: sql.NullInt64{
				Int64: req.GroupID,
				Valid: req.GroupID != 0,
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

// Delete schedule
func (server *Server) deleteSchedule(ctx *gin.Context) {
	var req getScheduleRequest
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

// Get schedules by teacher
func (server *Server) getSchedulesByTeacher(ctx *gin.Context) {
	teacherEmail := ctx.Param("email")
	if teacherEmail == "" {
		ctx.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("teacher email is required")))
		return
	}

	schedules, err := server.store.GetSchedulesByTeacher(ctx, StringToSQLNullString(teacherEmail))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if len(schedules) == 0 {
		ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("no schedules found for this teacher")))
		return
	}

	var scheduleResponses []detailedScheduleResponse
	for _, schedule := range schedules {
		scheduleResponses = append(scheduleResponses, newDetailedScheduleByTeacherResponse(schedule))
	}

	ctx.JSON(http.StatusOK, scheduleResponses)
}

// Get schedules by room
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

	schedules, err := server.store.GetSchedulesByRoom(ctx, sql.NullInt64{Int64: roomID, Valid: true})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if len(schedules) == 0 {
		ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("no schedules found for this room")))
		return
	}

	var scheduleResponses []detailedScheduleResponse
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

	schedules, err := server.store.GetSchedulesByGroup(ctx, sql.NullInt64{Int64: groupID, Valid: true})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if len(schedules) == 0 {
		ctx.JSON(http.StatusNotFound, errorResponse(fmt.Errorf("no schedules found for this group")))
		return
	}

	var scheduleResponses []detailedScheduleResponse
	for _, schedule := range schedules {
		scheduleResponses = append(scheduleResponses, newDetailedScheduleByGroupResponse(schedule))
	}

	ctx.JSON(http.StatusOK, scheduleResponses)
}
