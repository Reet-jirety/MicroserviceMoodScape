package handler

import (
	"auth-service/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AuthCallback(c *gin.Context) {
	var req struct {
		ID        string `json:"id"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		ImageURL  string `json:"imageUrl"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	// Check if user exists
	var user model.User
	result := model.DB.Where("clerk_id = ?", req.ID).First(&user)

	if result.Error != nil {
		// Create new user
		newUser := model.User{
			ClerkID:  req.ID,
			FullName: req.FirstName + " " + req.LastName,
			ImageURL: req.ImageURL,
		}

		if err := model.DB.Create(&newUser).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create user"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

func VerifyHandler(c *gin.Context) {
	_, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized - you must be logged in"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}