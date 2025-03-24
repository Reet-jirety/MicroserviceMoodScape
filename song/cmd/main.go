package main

import (
    "log"
    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "microservicemoodscape/song/internal/app/handlers"
)

func main() {
    // Initialize the Gin router
    router := gin.Default()

    // Fix CORS by allowing any origin properly
    config := cors.Config{
        AllowOrigins: []string{"*"}, // ✅ Only one wildcard '*' to prevent duplication
        AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
        AllowCredentials: false, // ✅ Allow credentials if needed
    }

    // Apply the CORS middleware
    router.Use(cors.New(config))

    // Initialize handlers
    handler := handlers.NewSongHandler()

    // Define routes
    router.GET("/songs/search", handler.SearchSongs)
    router.GET("/albums/search", handler.SearchAlbums)
    router.GET("/artists/search", handler.SearchArtists)
    router.GET("/search", handler.GeneralSearch)

    // Start the server on port 8010
    log.Fatal(router.Run(":8010"))
}
