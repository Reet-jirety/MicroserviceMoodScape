package main

import (
	"auth-service/db"
	"auth-service/handler"
	"auth-service/middleware"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	if err := db.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	router := gin.Default()

	// CORS configuration
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Routes
	router.GET("/verify", middleware.AuthMiddleware(), handler.VerifyHandler)
	authGroup := router.Group("/api/v1/auth")
	{
		authGroup.POST("/callback", handler.AuthCallback)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server is running on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}