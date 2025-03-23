package apis

import (
	"database/sql"
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
	db "github.com/nirajan1111/routiney/db/sqlc"
)

type addRoomRequest struct {
	Room_code        string `json:"room_code" binding:"required"`
	Block_no         string `json:"block_no" binding:"required"`
	Department       string `json:"department" binding:"required"`
	Floor_no         int32  `json:"floor_no" binding:"required"`
	Screen_available bool   `json:"screen_available" binding:"required"`
}
type newRoomresponse struct {
	ID               int32  `json:"id"`
	Room_code        string `json:"room_code"`
	Block_no         string `json:"block_no"`
	Department       string `json:"department"`
	Floor_no         int32  `json:"floor_no"`
	Screen_available bool   `json:"screen_available"`
}
type updateRoomRequest struct {
	Room_code        string `json:"room_code" binding:"required"`
	Block_no         string `json:"block_no" binding:"required"`
	Department       string `json:"department" binding:"required"`
	Floor_no         int32  `json:"floor_no" binding:"required"`
	Screen_available bool   `json:"screen_available" binding:"required"`
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
	fmt.Printf("Received request: %+v\n", req)
	floor_no := req.Floor_no
	arg := db.CreateRoomParams{
		FloorNo: sql.NullInt32{
			Int32: floor_no,
			Valid: true,
		},
		ScreenAvailable: sql.NullBool{
			Bool:  req.Screen_available,
			Valid: true,
		},
		RoomCode:   StringToSQLNullString(req.Room_code),
		Department: StringToSQLNullString(req.Department),
		BlockNo:    StringToSQLNullString(req.Block_no),
	}
	fmt.Printf("Creating room with params: %+v\n", arg)

	room, err := server.store.CreateRoom(ctx, arg)
	if err != nil {
		ctx.JSON(500, errorResponse(err))
		return
	}
	ctx.JSON(200, room)
}

func (server *Server) listRooms(ctx *gin.Context) {

	var req db.ListRoomsParams
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(400, errorResponse(err))
		return
	}
	if req.Limit == 0 {
		req.Limit = 10
	}
	if req.Offset == 0 {
		req.Offset = 0
	}

	rooms, err := server.store.ListRooms(ctx, req)
	if err != nil {
		ctx.JSON(500, errorResponse(err))
		return
	}

	var roomResponses []newRoomresponse
	for _, room := range rooms {
		roomResponse := newRoomresponse{
			ID:               room.ID,
			Room_code:        room.RoomCode.String,
			Block_no:         room.BlockNo.String,
			Department:       room.Department.String,
			Floor_no:         room.FloorNo.Int32,
			Screen_available: room.ScreenAvailable.Bool,
		}
		roomResponses = append(roomResponses, roomResponse)
	}
	fmt.Println(roomResponses)
	if len(roomResponses) == 0 {
		ctx.JSON(404, errorResponse(fmt.Errorf("no rooms found")))
		return
	}
	ctx.JSON(200, roomResponses)
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
	var reqData updateRoomRequest
	if err := ctx.ShouldBindJSON(&reqData); err != nil {
		ctx.JSON(400, errorResponse(err))
		return
	}
	arg := db.UpdateRoomParams{
		ID: int32(room_id_int),
		Department: sql.NullString{
			String: reqData.Department,
			Valid:  true,
		},
		RoomCode: sql.NullString{
			String: reqData.Room_code,
			Valid:  true,
		},
		BlockNo: sql.NullString{
			String: reqData.Block_no,
			Valid:  true,
		},
		FloorNo: sql.NullInt32{
			Int32: reqData.Floor_no,
			Valid: true,
		},
		ScreenAvailable: sql.NullBool{
			Bool:  reqData.Screen_available,
			Valid: true,
		},
	}
	room, err := server.store.UpdateRoom(ctx, arg)
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
