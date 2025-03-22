package api

import (
	"database/sql"
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
	db "github.com/nirajan1111/routiney/db/sqlc"
)

type addRoomRequest struct {
	room_code        string `json:"room_code" binding:"required"`
	block_no         string `json:"block_no" binding:"required"`
	department       string `json:"department" binding:"required"`
	floor_no         int32  `json:"floor_no" binding:"required"`
	screen_available bool   `json:"screen_available" binding:"required"`
}

func (server *Server) addRoom(ctx *gin.Context) {
	admin_status, err := checkAdmin(ctx, "admin")
	if err != nil {
		ctx.JSON(403, errorResponse(err))
		return
	}
	if !admin_status {
		ctx.JSON(403, errorResponse(err))
		return
	}
	var req addRoomRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(400, errorResponse(err))
		return
	}
	floor_no := req.floor_no
	arg := db.CreateRoomParams{
		FloorNo: sql.NullInt32{
			Int32: floor_no,
			Valid: true,
		},
		ScreenAvailable: sql.NullBool{
			Bool:  req.screen_available,
			Valid: true,
		},
		RoomCode:   StringToSQLNullString(req.room_code),
		Department: StringToSQLNullString(req.department),
		BlockNo:    StringToSQLNullString(req.block_no),
	}
	room, err := server.store.CreateRoom(ctx, arg)
	if err != nil {
		ctx.JSON(500, errorResponse(err))
		return
	}
	ctx.JSON(200, room)
}

func (server *Server) listRooms(ctx *gin.Context) {
	count_room, err := server.store.CountRooms(ctx)
	if err != nil {
		ctx.JSON(500, errorResponse(err))
		return
	}
	if count_room == 0 {
		ctx.JSON(404, errorResponse(err))
		return
	}
	var req db.ListRoomsParams
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(400, errorResponse(err))
		return
	}
	rooms, err := server.store.ListRooms(ctx, req)
	if err != nil {
		ctx.JSON(500, errorResponse(err))
		return
	}
	ctx.JSON(200, rooms)
}
func (server *Server) getRoom(ctx *gin.Context) {
	room_id := ctx.Param("id")
	if room_id == "" {
		ctx.JSON(400, errorResponse(fmt.Errorf("invalid room id")))
		return
	}
	room_id_int, err := strconv.Atoi(room_id)
	if err != nil {
		ctx.JSON(400, errorResponse(fmt.Errorf("invalid room id")))
		return
	}
	room, err := server.store.GetRoom(ctx, int32(room_id_int))
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(404, errorResponse(err))
			return
		}
		ctx.JSON(500, errorResponse(err))
		return
	}
	ctx.JSON(200, room)
}

func (server *Server) updateRoom(ctx *gin.Context) {
	admin_status, err := checkAdmin(ctx, "admin")
	if err != nil {
		ctx.JSON(403, errorResponse(err))
		return
	}
	if !admin_status {
		ctx.JSON(403, errorResponse(err))
		return
	}
	room_id := ctx.Param("id")
	if room_id == "" {
		ctx.JSON(400, errorResponse(fmt.Errorf("invalid room id")))
		return
	}
	room_id_int, err := strconv.Atoi(room_id)
	if err != nil {
		ctx.JSON(400, errorResponse(fmt.Errorf("invalid room id")))
		return
	}
	var req db.UpdateRoomParams
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(400, errorResponse(err))
		return
	}
	req.ID = int32(room_id_int)
	room, err := server.store.UpdateRoom(ctx, req)
	if err != nil {
		ctx.JSON(500, errorResponse(err))
		return
	}
	ctx.JSON(200, room)
}

func (server *Server) deleteRoom(ctx *gin.Context) {
	admin_status, err := checkAdmin(ctx, "admin")
	if err != nil {
		ctx.JSON(403, errorResponse(err))
		return
	}
	if !admin_status {
		ctx.JSON(403, errorResponse(err))
		return
	}
	room_id := ctx.Param("id")
	if room_id == "" {
		ctx.JSON(400, errorResponse(fmt.Errorf("invalid room id")))
		return
	}
	room_id_int, err := strconv.Atoi(room_id)
	if err != nil {
		ctx.JSON(400, errorResponse(fmt.Errorf("invalid room id")))
		return
	}
	err = server.store.DeleteRoom(ctx, int32(room_id_int))
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(404, errorResponse(err))
			return
		}
		ctx.JSON(500, errorResponse(err))
		return
	}
	ctx.JSON(200, gin.H{"message": "room deleted"})
}
