package middleware

import (
	"auth-service/model"
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lestrrat-go/jwx/v2/jwk"
	"github.com/lestrrat-go/jwx/v2/jwt"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Authorization header missing"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Invalid token format"})
			return
		}

		// Verify JWT using Clerk's public key
		token, err := jwt.ParseString(tokenString,
			jwt.WithKeySet(jwk.NewAutoRefresh(context.Background())),
			jwt.WithValidate(true),
		)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Invalid token"})
			return
		}

		// Extract user ID from token
		userID, ok := token.Get("sub")
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Invalid token claims"})
			return
		}

		// Check if user exists in database
		var user model.User
		if result := model.DB.Where("clerk_id = ?", userID).First(&user); result.Error != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "User not found"})
			return
		}

		// Store user in context
		c.Set("userID", userID)
		c.Next()
	}
}