package api

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/nirajan1111/routiney/token"
)

func authMiddleware(tokenMaker token.Maker) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(401, errorResponse(fmt.Errorf("authorization header is required")))
			c.Abort()
			return
		}
		token := strings.TrimPrefix(authHeader, "Bearer ")
		payload, err := tokenMaker.VerifyToken(token)
		if err != nil {
			c.JSON(401, errorResponse(err))
			c.Abort()
			return
		}
		c.Set("user", payload)
		c.Next()

	}
}
