package api

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/nirajan1111/routiney/token"
)

const (
	AuthTokenExpiredCode = "TOKEN_EXPIRED"
)

func authMiddleware(tokenMaker token.Maker) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "authorization header is required",
				"code":  "AUTH_REQUIRED",
			})
			c.Abort()
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		payload, err := tokenMaker.VerifyToken(token)
		if err != nil {
			// Check if it's specifically a token expiration error
			if strings.Contains(err.Error(), "token has expired") {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error":    "token has expired",
					"code":     AuthTokenExpiredCode,
					"redirect": "/login",
				})
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": err.Error(),
					"code":  "INVALID_TOKEN",
				})
			}
			c.Abort()
			return
		}

		c.Set("user", payload)
		c.Next()
	}
}
